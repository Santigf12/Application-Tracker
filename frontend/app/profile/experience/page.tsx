'use client';

import { getErrorMessage } from '@/lib/api';
import {
  useCreateExperience,
  useDeleteExperience,
  useExperiences,
  useUpdateExperience,
} from '@/lib/features/profile/hooks';
import type { Experience } from '@/lib/features/profile/types';
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

type ExperienceRow = {
  id: React.Key;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  bullets: BulletRow[];
  isNew?: boolean;
};

const makeTempId = () =>
  `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const toRow = (experience: Experience): ExperienceRow => ({
  id: experience.id ?? makeTempId(),
  title: experience.title ?? '',
  company: experience.company ?? '',
  location: experience.location ?? '',
  startDate: experience.start_date ?? '',
  endDate: experience.end_date ?? '',
  description: experience.description ?? '',
  bullets: (experience.bullets ?? []).map((bullet) => ({
    id: bullet.id ?? makeTempId(),
    content: bullet.content,
  })),
});

const toPayload = (row: ExperienceRow, position: number): Experience => ({
  id:
    typeof row.id === 'string' && !String(row.id).startsWith('tmp-')
      ? String(row.id)
      : undefined,
  title: row.title,
  company: row.company,
  location: row.location,
  start_date: row.startDate,
  end_date: row.endDate,
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

export default function ExperiencePage() {
  const { data: experiences = [], isLoading } = useExperiences();
  const createExperienceMutation = useCreateExperience();
  const updateExperienceMutation = useUpdateExperience();
  const deleteExperienceMutation = useDeleteExperience();
  const { message } = App.useApp();

  const serverRows = useMemo(() => experiences.map(toRow), [experiences]);

  const [editingData, setEditingData] = useState<ExperienceRow[]>([]);
  const [editableKeys, setEditableKeys] = useState<React.Key[]>([]);

  const dataSource =
    editableKeys.length === 0
      ? serverRows
      : editingData.length > 0
        ? editingData
        : serverRows;

  const loading =
    isLoading ||
    createExperienceMutation.isPending ||
    updateExperienceMutation.isPending ||
    deleteExperienceMutation.isPending;

  const updateBullets = (experienceId: React.Key, bullets: BulletRow[]) => {
    setEditingData((prev) => {
      const base = prev.length > 0 ? prev : dataSource;

      return base.map((row) =>
        row.id === experienceId ? { ...row, bullets } : row,
      );
    });
  };

  const persistBullets = async (experienceId: React.Key, bullets: BulletRow[]) => {
    const base = editingData.length > 0 ? editingData : dataSource;

    const row = base.find((item) => item.id === experienceId);
    if (!row) return;

    if (String(experienceId).startsWith('tmp-')) {
      message.error('Save the experience first before saving bullets.');
      return;
    }

    const updatedRow: ExperienceRow = {
      ...row,
      bullets,
    };

    const index = base.findIndex((item) => item.id === experienceId);
    const payload = toPayload(updatedRow, index >= 0 ? index : 0);

    await updateExperienceMutation.mutateAsync({
      id: String(experienceId),
      experience: payload,
    });

    setEditingData((prev) => {
      const source = prev.length > 0 ? prev : base;
      return source.map((item) =>
        item.id === experienceId ? updatedRow : item,
      );
    });
  };

  const columns: ProColumns<ExperienceRow>[] = [
    {
      title: 'Title',
      dataIndex: 'title',
      formItemProps: {
        rules: [{ required: true, message: 'Required' }],
      },
    },
    {
      title: 'Company',
      dataIndex: 'company',
      formItemProps: {
        rules: [{ required: true, message: 'Required' }],
      },
    },
    {
      title: 'Location',
      dataIndex: 'location',
    },
    {
      title: 'Start',
      dataIndex: 'startDate',
    },
    {
      title: 'End',
      dataIndex: 'endDate',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      valueType: 'textarea',
      width: 450,
    },
    {
      title: '',
      valueType: 'option',
      width: 80,
      render: (_, row, __, action) => [
        <a key="edit" onClick={() => action?.startEditable(row.id)}>
          Edit
        </a>,
      ],
    },
  ];

  return (
    <EditableProTable<ExperienceRow>
      rowKey="id"
      loading={loading}
      columns={columns}
      value={dataSource}
      tableLayout="fixed"
      recordCreatorProps={{
        newRecordType: 'cache',
        record: () => ({
          id: makeTempId(),
          title: '',
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          description: '',
          bullets: [],
          isNew: true,
        }),
        creatorButtonText: 'Add experience',
      }}
      editable={{
        type: 'multiple',
        editableKeys,
        onChange: (keys) => setTimeout(() => setEditableKeys(keys), 0),
        actionRender: (_, __, { save, delete: del, cancel }) => [save, cancel, del],
        onValuesChange: (_record, rows) => {
          setEditingData(rows as ExperienceRow[]);
        },
        onSave: async (key, row) => {
          const index = dataSource.findIndex((item) => item.id === key);
          const payload = toPayload(row as ExperienceRow, index >= 0 ? index : 0);

          try {
            if ((row as ExperienceRow).isNew || String(key).startsWith('tmp-')) {
              await createExperienceMutation.mutateAsync(payload);
              message.success('Experience created');
            } else {
              await updateExperienceMutation.mutateAsync({
                id: String(key),
                experience: payload,
              });
              message.success('Experience updated');
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
            await deleteExperienceMutation.mutateAsync(String(key));
            message.success('Experience deleted');
            return true;
          } catch (error) {
            message.error(getErrorMessage(error));
            return false;
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