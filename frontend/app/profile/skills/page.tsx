'use client';

import {
  useCreateSkill,
  useCreateSkillGroup,
  useDeleteSkill,
  useDeleteSkillGroup,
  useSkillGroups,
  useSkills,
  useUpdateSkillGroup,
} from '@/lib/features/profile/hooks';
import type { SkillGroup } from '@/lib/features/profile/types';
import {
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { InputRef } from 'antd';
import {
  Button,
  Card,
  Col,
  Input,
  message,
  Popconfirm,
  Row,
  Space,
  Tag,
  Typography,
} from 'antd';
import { useMemo, useRef, useState } from 'react';

export default function SkillsPage() {
  const { data: skillGroups = [], isLoading: loadingGroups } = useSkillGroups();
  const { data: skills = [], isLoading: loadingSkills } = useSkills();

  const createSkillGroupMutation = useCreateSkillGroup();
  const updateSkillGroupMutation = useUpdateSkillGroup();
  const deleteSkillGroupMutation = useDeleteSkillGroup();

  const createSkillMutation = useCreateSkill();
  const deleteSkillMutation = useDeleteSkill();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [titleDrafts, setTitleDrafts] = useState<Record<string, string>>({});

  const skillInputRefs = useRef<Record<string, InputRef | null>>({});
  const titleInputRefs = useRef<Record<string, InputRef | null>>({});

  const groups = useMemo(() => {
    return skillGroups.map((group) => ({
      ...group,
      skills: skills
        .filter((skill) => skill.skill_group_id === group.id)
        .sort((a, b) => a.position - b.position),
    }));
  }, [skillGroups, skills]);

  const isEditing = (id?: string) => !!id && editingId === id;

  const loading =
    loadingGroups ||
    loadingSkills ||
    createSkillGroupMutation.isPending ||
    updateSkillGroupMutation.isPending ||
    deleteSkillGroupMutation.isPending ||
    createSkillMutation.isPending ||
    deleteSkillMutation.isPending;

  const addGroup = async () => {
    try {
      const position = skillGroups.length;

      await createSkillGroupMutation.mutateAsync({
        title: 'New Group',
        position,
      });

      message.success('Skill group created');
    } catch (error) {
      const text =
        error instanceof Error ? error.message : 'Failed to create skill group';
      message.error(text);
    }
  };

  const saveGroupTitle = async (group: SkillGroup & { skills?: unknown[] }) => {
    if (!group.id) return;

    const nextTitle = (titleDrafts[group.id] ?? group.title).trim();

    if (!nextTitle) {
      message.error('Group title cannot be empty');
      return;
    }

    try {
      await updateSkillGroupMutation.mutateAsync({
        id: group.id,
        skillGroup: {
          id: group.id,
          title: nextTitle,
          position: group.position,
          skills: group.skills,
        },
      });

      setEditingId(null);
      message.success('Skill group updated');
    } catch (error) {
      const text =
        error instanceof Error ? error.message : 'Failed to update skill group';
      message.error(text);
    }
  };

  const startEditingGroup = (group: SkillGroup) => {
    if (!group.id) return;

    setTitleDrafts((prev) => ({
      ...prev,
      [group.id!]: group.title,
    }));
    setEditingId(group.id);

    setTimeout(() => titleInputRefs.current[group.id!]?.focus(), 0);
  };

  const deleteGroup = async (groupId?: string) => {
    if (!groupId) return;

    try {
      await deleteSkillGroupMutation.mutateAsync(groupId);

      if (editingId === groupId) {
        setEditingId(null);
      }

      message.success('Skill group deleted');
    } catch (error) {
      const text =
        error instanceof Error ? error.message : 'Failed to delete skill group';
      message.error(text);
    }
  };

  const addSkill = async (groupId?: string) => {
    if (!groupId) return;

    const val = (inputValues[groupId] ?? '').trim();
    if (!val) {
      message.error('Skill name cannot be empty');
      return;
    }

    const groupSkills = skills.filter((skill) => skill.skill_group_id === groupId);
    const alreadyExists = groupSkills.some(
      (skill) => skill.name.toLowerCase() === val.toLowerCase()
    );

    if (alreadyExists) {
      message.error('That skill already exists in this group');
      return;
    }

    try {
      await createSkillMutation.mutateAsync({
        skill_group_id: groupId,
        name: val,
        position: groupSkills.length,
      });

      setInputValues((prev) => ({ ...prev, [groupId]: '' }));
      setTimeout(() => skillInputRefs.current[groupId]?.focus(), 0);
      message.success('Skill added');
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Failed to add skill';
      message.error(text);
    }
  };

  const removeSkill = async (skillId?: string) => {
    if (!skillId) return;

    try {
      await deleteSkillMutation.mutateAsync(skillId);
      message.success('Skill removed');
    } catch (error) {
      const text =
        error instanceof Error ? error.message : 'Failed to remove skill';
      message.error(text);
    }
  };

  if (loadingGroups || loadingSkills) {
    return <Typography.Text>Loading skills...</Typography.Text>;
  }

  return (
    <Row gutter={[16, 16]}>
      {groups.map((group) => (
        <Col key={group.id} xs={24} md={12} xl={8}>
          <Card
            type="inner"
            title={
              isEditing(group.id) ? (
                <Input
                  ref={(el) => {
                    if (group.id) titleInputRefs.current[group.id] = el;
                  }}
                  size="small"
                  value={group.id ? titleDrafts[group.id] ?? group.title : group.title}
                  placeholder="Group title"
                  onChange={(e) => {
                    if (!group.id) return;
                    setTitleDrafts((prev) => ({
                      ...prev,
                      [group.id!]: e.target.value,
                    }));
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onPressEnter={() => saveGroupTitle(group)}
                />
              ) : (
                group.title || 'Untitled Group'
              )
            }
            style={{ height: '100%' }}
            actions={[
              <Button
                key="edit"
                type="text"
                size="small"
                disabled={loading}
                icon={isEditing(group.id) ? <CheckOutlined /> : <EditOutlined />}
                onClick={() => {
                  if (!group.id) return;

                  if (isEditing(group.id)) {
                    void saveGroupTitle(group);
                  } else {
                    startEditingGroup(group);
                  }
                }}
              >
                {isEditing(group.id) ? 'Done' : 'Edit'}
              </Button>,
              <Popconfirm
                key="delete"
                title="Delete skill group?"
                description="This will also remove its skills."
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
                onConfirm={() => deleteGroup(group.id)}
              >
                <Button
                  type="text"
                  size="small"
                  danger
                  disabled={loading}
                  icon={<DeleteOutlined />}
                >
                  Delete
                </Button>
              </Popconfirm>,
            ]}
          >
            <Space orientation="vertical" size="small" style={{ width: '100%' }}>
              <Space size={[6, 6]} wrap>
                {group.skills.length === 0 && !isEditing(group.id) && (
                  <Typography.Text type="secondary">
                    No skills yet.
                  </Typography.Text>
                )}

                {group.skills.map((skill) => (
                  <Tag
                    key={skill.id ?? skill.name}
                    closable={isEditing(group.id)}
                    onClose={(e) => {
                      e.preventDefault();
                      void removeSkill(skill.id);
                    }}
                  >
                    {skill.name}
                  </Tag>
                ))}
              </Space>

              {isEditing(group.id) && group.id && (
                <Space.Compact style={{ width: '100%' }}>
                  <Input
                    ref={(el) => {
                      skillInputRefs.current[group.id!] = el;
                    }}
                    size="small"
                    placeholder="Type a skill and press Enter"
                    value={inputValues[group.id] ?? ''}
                    onChange={(e) =>
                      setInputValues((prev) => ({
                        ...prev,
                        [group.id!]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        void addSkill(group.id);
                      }
                    }}
                    disabled={loading}
                  />
                  <Button
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => void addSkill(group.id)}
                    disabled={loading}
                  />
                </Space.Compact>
              )}
            </Space>
          </Card>
        </Col>
      ))}

      <Col xs={24} md={12} xl={8}>
        <Card
          type="inner"
          style={{
            height: '100%',
            borderStyle: 'dashed',
            cursor: loading ? 'not-allowed' : 'pointer',
            textAlign: 'center',
          }}
          onClick={() => {
            if (!loading) {
              void addGroup();
            }
          }}
        >
          <Typography.Text type="secondary">
            <PlusOutlined /> Add skill group
          </Typography.Text>
        </Card>
      </Col>
    </Row>
  );
}