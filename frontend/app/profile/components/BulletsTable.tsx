'use client';

import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { EditableProTable } from '@ant-design/pro-components';
import { App } from 'antd';
import { useRef, useState } from 'react';

export type BulletRow = {
  id: React.Key;
  content: string;
};

type BulletsTableProps = {
  parentId: React.Key;
  bullets: BulletRow[];
  onChange: (id: React.Key, bullets: BulletRow[]) => void;
  onPersist?: (id: React.Key, bullets: BulletRow[]) => Promise<void>;
};

const makeTempBulletId = () => `new-bullet-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export default function BulletsTable({
  parentId,
  bullets,
  onChange,
  onPersist,
}: BulletsTableProps) {
  const [editableKeys, setEditableKeys] = useState<React.Key[]>([]);
  const actionRef = useRef<ActionType | null>(null);
  const { message } = App.useApp();

  const columns: ProColumns<BulletRow>[] = [
    {
      title: 'Bullet',
      dataIndex: 'content',
      formItemProps: {
        rules: [{ required: true, message: 'Bullet content is required' }],
      },
    },
    {
      title: '',
      valueType: 'option',
      width: 90,
      render: (_, row, __, action) => [
        <a key="edit" onClick={() => action?.startEditable(row.id)}>
          Edit
        </a>,
      ],
    },
  ];

  return (
    <EditableProTable<BulletRow>
      actionRef={actionRef}
      rowKey="id"
      columns={columns}
      value={bullets}
      recordCreatorProps={{
        newRecordType: 'cache',
        record: () => ({ id: makeTempBulletId(), content: '' }),
        creatorButtonText: 'Add bullet',
        position: 'bottom',
      }}
      editable={{
        type: 'multiple',
        editableKeys,
        onChange: (keys) => {
          setTimeout(() => setEditableKeys(keys), 0);
        },
        actionRender: (_, __, { save, delete: del, cancel }) => [save, cancel, del],
        onValuesChange: (_, rows) => {
          onChange(parentId, rows as BulletRow[]);
        },
        onSave: async (_key, row) => {
          const nextBullets = bullets.some((b) => b.id === row.id)
            ? bullets.map((b) =>
                b.id === row.id ? ({ ...b, ...row } as BulletRow) : b,
              )
            : [...bullets, row as BulletRow];

          onChange(parentId, nextBullets);

          if (onPersist) {
            await onPersist(parentId, nextBullets);
            message.success('Bullet saved');
          }

          return true;
        },
        onDelete: async (key) => {
          const nextBullets = bullets.filter((b) => b.id !== key);

          onChange(parentId, nextBullets);

          if (onPersist) {
            await onPersist(parentId, nextBullets);
            message.success('Bullet deleted');
          }

          return true;
        },
      }}
      search={false}
      options={false}
      pagination={false}
      toolBarRender={false}
      cardProps={false}
      style={{ margin: 0 }}
    />
  );
}