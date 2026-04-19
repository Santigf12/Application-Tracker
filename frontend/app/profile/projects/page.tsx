'use client';

import { getErrorMessage } from '@/lib/api';
import {
  useCreateProject,
  useDeleteProject,
  useProjects,
  useUpdateProject,
} from '@/lib/features/profile/hooks';
import type { Project } from '@/lib/features/profile/types';
import type { ProColumns } from '@ant-design/pro-components';
import { App } from 'antd';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import BulletsTable, { type BulletRow } from '../components/BulletsTable';

// @ant-design/pro-components accesses `window` during render, which breaks
// Next.js server-side prerendering. Dynamically importing with ssr:false
// ensures it only runs in the browser.
const EditableProTable = dynamic(
  () => import('@ant-design/pro-components').then((mod) => mod.EditableProTable),
  { ssr: false },
) as typeof import('@ant-design/pro-components').EditableProTable;

type ProjectRow = {
  id: React.Key;
  name: string;
  startDate: string;
  endDate: string;
  stack: string;
  links: string;
  description: string;
  bullets: BulletRow[];
  isNew?: boolean;
};

const makeTempId = () =>
  `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const toRow = (project: Project): ProjectRow => ({
  id: project.id ?? makeTempId(),
  name: project.name ?? '',
  startDate: project.start_date ?? '',
  endDate: project.end_date ?? '',
  stack: project.stack ?? '',
  links: project.links ?? '',
  description: project.description ?? '',
  bullets: (project.bullets ?? []).map((bullet) => ({
    id: bullet.id ?? makeTempId(),
    content: bullet.content,
  })),
});

const toPayload = (row: ProjectRow, position: number): Project => ({
  id:
    typeof row.id === 'string' && !String(row.id).startsWith('tmp-')
      ? String(row.id)
      : undefined,
  name: row.name,
  start_date: row.startDate,
  end_date: row.endDate,
  stack: row.stack,
  links: row.links,
  description: row.description,
  position,
  bullets: row.bullets.map((bullet, index) => ({
    id:
      typeof bullet.id === 'string' && !String(bullet.id).startsWith('new-bullet-')
        ? String(bullet.id)
        : undefined,
    content: bullet.content,
    position: index,
  })),
});

export default function ProjectsPage() {
  const { data: projects = [], isLoading } = useProjects();
  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();
  const { message } = App.useApp();

  const serverRows = useMemo(() => projects.map(toRow), [projects]);

  const [editingData, setEditingData] = useState<ProjectRow[]>([]);
  const [editableKeys, setEditableKeys] = useState<React.Key[]>([]);

  const dataSource =
    editableKeys.length === 0
      ? serverRows
      : editingData.length > 0
        ? editingData
        : serverRows;

  const loading =
    isLoading ||
    createProjectMutation.isPending ||
    updateProjectMutation.isPending ||
    deleteProjectMutation.isPending;

  const updateBullets = (projectId: React.Key, bullets: BulletRow[]) => {
    setEditingData((prev) => {
      const base = prev.length > 0 ? prev : dataSource;

      return base.map((row) =>
        row.id === projectId ? { ...row, bullets } : row,
      );
    });
  };

  const persistBullets = async (projectId: React.Key, bullets: BulletRow[]) => {
    const base = editingData.length > 0 ? editingData : dataSource;

    const row = base.find((item) => item.id === projectId);
    if (!row) return;

    if (String(projectId).startsWith('tmp-')) {
      message.error('Save the project first before saving bullets.');
      return;
    }

    const updatedRow: ProjectRow = {
      ...row,
      bullets,
    };

    const index = base.findIndex((item) => item.id === projectId);
    const payload = toPayload(updatedRow, index >= 0 ? index : 0);

    await updateProjectMutation.mutateAsync({
      id: String(projectId),
      project: payload,
    });

    setEditingData((prev) => {
      const source = prev.length > 0 ? prev : base;
      return source.map((item) =>
        item.id === projectId ? updatedRow : item,
      );
    });
  };

  const columns: ProColumns<ProjectRow>[] = [
    {
      title: 'Project Name',
      dataIndex: 'name',
      width: 180,
      formItemProps: {
        rules: [{ required: true, message: 'Required' }],
      },
    },
    {
      title: 'Start',
      dataIndex: 'startDate',
      width: 120,
    },
    {
      title: 'End',
      dataIndex: 'endDate',
      width: 120,
    },
    {
      title: 'Stack',
      dataIndex: 'stack',
      width: 180,
    },
    {
      title: 'Links',
      dataIndex: 'links',
      width: 200,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      valueType: 'textarea',
      ellipsis: true,
    },
    {
      title: '',
      valueType: 'option',
      width: 120,
      render: (_, row, __, action) => [
        <a key="edit" onClick={() => action?.startEditable(row.id)}>
          Edit
        </a>,
      ],
    },
  ];

  return (
    <EditableProTable<ProjectRow>
      rowKey="id"
      loading={loading}
      columns={columns}
      value={dataSource}
      recordCreatorProps={{
        newRecordType: 'cache',
        record: () => ({
          id: makeTempId(),
          name: '',
          startDate: '',
          endDate: '',
          stack: '',
          links: '',
          description: '',
          bullets: [],
          isNew: true,
        }),
        creatorButtonText: 'Add project',
      }}
      editable={{
        type: 'multiple',
        editableKeys,
        onChange: (keys) => setTimeout(() => setEditableKeys(keys), 0),
        actionRender: (_, __, { save, delete: del, cancel }) => [save, cancel, del],
        onValuesChange: (_record, rows) => {
          setEditingData(rows as ProjectRow[]);
        },
        onSave: async (key, row) => {
          const index = dataSource.findIndex((item) => item.id === key);
          const payload = toPayload(row as ProjectRow, index >= 0 ? index : 0);

          try {
            if ((row as ProjectRow).isNew || String(key).startsWith('tmp-')) {
              await createProjectMutation.mutateAsync(payload);
              message.success('Project created');
            } else {
              await updateProjectMutation.mutateAsync({
                id: String(key),
                project: payload,
              });
              message.success('Project updated');
            }
          } catch (error) {
            message.error(getErrorMessage(error));
            throw error;
          }
        },
        onDelete: async (key) => {
          if (String(key).startsWith('tmp-')) {
            return true;
          }

          try {
            await deleteProjectMutation.mutateAsync(String(key));
            message.success('Project deleted');
            return true;
          } catch (error) {
            message.error(getErrorMessage(error));
            return false;
          }
        },
        onCancel: async (key) => {
          if (String(key).startsWith('tmp-')) {
            setEditingData((prev) => prev.filter((item) => item.id !== key));
          }
        },
      }}
      expandable={{
        expandedRowRender: (row) => (
          <BulletsTable
            parentId={row.id}
            bullets={row.bullets}
            onChange={updateBullets}
            onPersist={persistBullets}
          />
        ),
      }}
    />
  );
}