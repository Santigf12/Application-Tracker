'use client';

import { HolderOutlined } from '@ant-design/icons';
import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { TableColumnsType } from 'antd';
import {
  App,
  Button,
  Card,
  Flex,
  Form,
  Space,
  Switch,
  Table,
  Typography,
} from 'antd';
import { useParams } from 'next/navigation';
import React, { useContext, useEffect, useMemo, useState } from 'react';

import {
  useApplication,
  useResume,
  useSaveResume,
} from '@/lib/features/applications/hooks';
import { useProfile } from '@/lib/features/profile/hooks';
import type { Profile } from '@/lib/features/profile/types';
import { useGenerateResume, useTailorProfile } from '@/lib/features/tools/hooks';
import type {
  ExperienceManifest,
  GenerateResumePayload,
  ProjectManifest,
  TailoredProfileResponse,
} from '@/lib/features/tools/types';

type BulletRow = {
  key: string;
  id: string;
  content: string;
  position: number;
};

type ExperienceSection = {
  id: string;
  title: string;
  company: string;
  bullets: BulletRow[];
};

type ProjectSection = {
  id: string;
  name: string;
  bullets: BulletRow[];
};

interface RowContextProps {
  setActivatorNodeRef?: (element: HTMLElement | null) => void;
  listeners?: SyntheticListenerMap;
}

const RowContext = React.createContext<RowContextProps>({});

const DragHandle: React.FC = () => {
  const { setActivatorNodeRef, listeners } = useContext(RowContext);

  return (
    <Button
      type="text"
      size="small"
      icon={<HolderOutlined />}
      style={{ cursor: 'move' }}
      ref={setActivatorNodeRef}
      {...listeners}
    />
  );
};

interface SortableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': string;
}

const SortableRow: React.FC<SortableRowProps> = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props['data-row-key'] });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
    ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
  };

  const contextValue = useMemo<RowContextProps>(
    () => ({ setActivatorNodeRef, listeners }),
    [setActivatorNodeRef, listeners],
  );

  return (
    <RowContext.Provider value={contextValue}>
      <tr {...props} ref={setNodeRef} style={style} {...attributes} />
    </RowContext.Provider>
  );
};

const bulletColumns: TableColumnsType<BulletRow> = [
  {
    key: 'sort',
    align: 'center',
    width: 64,
    render: () => <DragHandle />,
  },
  {
    title: 'Bullet Point',
    dataIndex: 'content',
    key: 'content',
  },
];

const mapTailoredProfileToExperienceSections = (
  tailoredProfile: TailoredProfileResponse,
): ExperienceSection[] =>
  tailoredProfile.experiences.map((experience) => ({
    id: experience.id ?? '',
    title: experience.title,
    company: experience.company,
    bullets: experience.bullets.map((bullet, index) => ({
      key: bullet.id ?? `${experience.id}-bullet-${index}`,
      id: bullet.id ?? `${experience.id}-bullet-${index}`,
      content: bullet.content,
      position: index,
    })),
  }));

const mapTailoredProfileToProjectSections = (
  tailoredProfile: TailoredProfileResponse,
): ProjectSection[] =>
  tailoredProfile.projects.map((project) => ({
    id: project.id ?? '',
    name: project.name,
    bullets: project.bullets.map((bullet, index) => ({
      key: bullet.id ?? `${project.id}-bullet-${index}`,
      id: bullet.id ?? `${project.id}-bullet-${index}`,
      content: bullet.content,
      position: index,
    })),
  }));

const mapSavedResumeToExperienceSections = (
  profile: Profile,
  experienceManifest: ExperienceManifest[] = [],
): ExperienceSection[] => {
  return experienceManifest
    .map((savedExperience) => {
      const profileExperience = profile.experiences.find(
        (experience) => experience.id === savedExperience.id,
      );

      if (!profileExperience) return null;

      const bullets = savedExperience.bullets
        .map((bulletId, index) => {
          const profileBullet = profileExperience.bullets.find(
            (bullet) => bullet.id === bulletId,
          );

          if (!profileBullet) return null;

          return {
            key: profileBullet.id ?? `${profileExperience.id}-bullet-${index}`,
            id: profileBullet.id ?? `${profileExperience.id}-bullet-${index}`,
            content: profileBullet.content,
            position: index,
          };
        })
        .filter((bullet): bullet is BulletRow => bullet !== null);

      return {
        id: profileExperience.id ?? '',
        title: profileExperience.title,
        company: profileExperience.company,
        bullets,
      };
    })
    .filter((experience): experience is ExperienceSection => experience !== null);
};

const mapSavedResumeToProjectSections = (
  profile: Profile,
  projectManifest: ProjectManifest[] = [],
): ProjectSection[] => {
  return projectManifest
    .filter((savedProject) => savedProject.include !== false)
    .map((savedProject) => {
      const profileProject = profile.projects.find(
        (project) => project.id === savedProject.id,
      );

      if (!profileProject) return null;

      const bullets = savedProject.bullets
        .map((bulletId, index) => {
          const profileBullet = profileProject.bullets.find(
            (bullet) => bullet.id === bulletId,
          );

          if (!profileBullet) return null;

          return {
            key: profileBullet.id ?? `${profileProject.id}-bullet-${index}`,
            id: profileBullet.id ?? `${profileProject.id}-bullet-${index}`,
            content: profileBullet.content,
            position: index,
          };
        })
        .filter((bullet): bullet is BulletRow => bullet !== null);

      return {
        id: profileProject.id ?? '',
        name: profileProject.name,
        bullets,
      };
    })
    .filter((project): project is ProjectSection => project !== null);
};

const buildExperienceManifest = (sections: ExperienceSection[]): ExperienceManifest[] =>
  sections.map((experience) => ({
    id: experience.id,
    bullets: [...experience.bullets]
      .sort((a, b) => a.position - b.position)
      .map((bullet) => bullet.id),
  }));

const buildProjectManifest = (sections: ProjectSection[]): ProjectManifest[] =>
  sections.map((project) => ({
    id: project.id,
    include: true,
    bullets: [...project.bullets]
      .sort((a, b) => a.position - b.position)
      .map((bullet) => bullet.id),
  }));

const buildResumeManifest = (
  experienceSections: ExperienceSection[],
  projectSections: ProjectSection[],
  includePublications: boolean,
): GenerateResumePayload => ({
  experiences: buildExperienceManifest(experienceSections),
  projects: buildProjectManifest(projectSections),
  include_publications: includePublications,
});

type DraggableBulletTableProps = {
  title: React.ReactNode;
  rows: BulletRow[];
  onChange: (rows: BulletRow[]) => void;
};

function DraggableBulletTable({
  title,
  rows,
  onChange,
}: DraggableBulletTableProps) {
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    const activeIndex = rows.findIndex((record) => record.key === active.id);
    const overIndex = rows.findIndex((record) => record.key === over.id);

    const reordered = arrayMove(rows, activeIndex, overIndex).map((item, index) => ({
      ...item,
      position: index,
    }));

    onChange(reordered);
  };

  return (
    <Card size="small" title={title}>
      <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
        <SortableContext
          items={rows.map((item) => item.key)}
          strategy={verticalListSortingStrategy}
        >
          <Table<BulletRow>
            rowKey="key"
            components={{ body: { row: SortableRow } }}
            columns={bulletColumns}
            dataSource={rows}
            pagination={false}
            size="small"
          />
        </SortableContext>
      </DndContext>
    </Card>
  );
}

export default function ResumeTabPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  const [form] = Form.useForm();
  const { notification } = App.useApp();

  const { data: application } = useApplication(id, !!id);
  const { data: savedResume } = useResume(id, !!id);
  const { data: profile } = useProfile();

  const tailorProfileMutation = useTailorProfile();
  const generateResumeMutation = useGenerateResume();
  const saveResumeMutation = useSaveResume();

  const [experienceSectionsOverride, setExperienceSectionsOverride] = useState<ExperienceSection[] | null>(null);
  const [projectSectionsOverride, setProjectSectionsOverride] = useState<ProjectSection[] | null>(null);

  // Derive sections directly from saved data — no setState needed.
  const derivedExperienceSections = useMemo(() => {
    if (!savedResume || !profile) return [];
    return mapSavedResumeToExperienceSections(profile, savedResume.manifest.experiences ?? []);
  }, [savedResume, profile]);

  const derivedProjectSections = useMemo(() => {
    if (!savedResume || !profile) return [];
    return mapSavedResumeToProjectSections(profile, savedResume.manifest.projects ?? []);
  }, [savedResume, profile]);

  // Sync the form toggle — form is an external system, so this useEffect is correct.
  useEffect(() => {
    if (!savedResume) return;
    form.setFieldValue('include_publications', Boolean(savedResume.include_publications));
  }, [savedResume, form]);

  // The active sections are the user-generated override, or the derived data if no override exists.
  const experienceSections = experienceSectionsOverride ?? derivedExperienceSections;
  const projectSections = projectSectionsOverride ?? derivedProjectSections;

  // Keep the same call-sites below working without any further changes.
  const setExperienceSections = setExperienceSectionsOverride;
  const setProjectSections = setProjectSectionsOverride;

  const handleGenerateResumeData = async () => {
    try {
      const values = form.getFieldsValue();

      if (!application?.title || !application?.posting) {
        notification.error({
          message: 'Error',
          description: 'Application title and posting are required',
          placement: 'topLeft',
        });
        return;
      }

      const tailoredProfile = await tailorProfileMutation.mutateAsync({
        company: application.company,
        position: application.title,
        jobPosting: application.posting,
      });

      setExperienceSections(mapTailoredProfileToExperienceSections(tailoredProfile));
      setProjectSections(mapTailoredProfileToProjectSections(tailoredProfile));

      form.setFieldValue(
        'include_publications',
        tailoredProfile.publications.length > 0 || values.include_publications,
      );

      notification.success({
        title: 'Success',
        description: 'Tailored resume data generated',
        placement: 'topLeft',
      });
    } catch {
      notification.error({
        title: 'Error',
        description: 'Failed to generate tailored resume data',
        placement: 'topLeft',
      });
    }
  };

  const handleDownloadResumeDoc = async () => {
    try {
      const values = form.getFieldsValue();

      const blob = await generateResumeMutation.mutateAsync({
        experiences: buildExperienceManifest(experienceSections),
        projects: buildProjectManifest(projectSections),
        include_publications: Boolean(values.include_publications),
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'santiago-fuentes-resume.docx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      notification.success({
        title: 'Success',
        description: 'Resume downloaded successfully',
        placement: 'topLeft',
      });
    } catch {
      notification.error({
        title: 'Error',
        description: 'Failed to download resume',
        placement: 'topLeft',
      });
    }
  };

  const handleSaveResumeData = async () => {
    try {
      const values = form.getFieldsValue();

      const manifest = buildResumeManifest(
        experienceSections,
        projectSections,
        Boolean(values.include_publications),
      );

      await saveResumeMutation.mutateAsync({
        id,
        include_publications: Boolean(values.include_publications),
        manifest,
      });

      notification.success({
        title: 'Success',
        description: 'Resume data saved',
        placement: 'topLeft',
      });
    } catch {
      notification.error({
        title: 'Error',
        description: 'Failed to save resume data',
        placement: 'topLeft',
      });
    }
  };

  const updateExperienceBullets = (experienceId: string, rows: BulletRow[]) => {
    setExperienceSectionsOverride((prev) =>
      (prev ?? derivedExperienceSections).map((experience) =>
        experience.id === experienceId ? { ...experience, bullets: rows } : experience,
      ),
    );
  };

  const updateProjectBullets = (projectId: string, rows: BulletRow[]) => {
    setProjectSectionsOverride((prev) =>
      (prev ?? derivedProjectSections).map((project) =>
        project.id === projectId ? { ...project, bullets: rows } : project,
      ),
    );
  } ;

  return (
    <Space orientation="vertical" size="middle" style={{ width: '100%', paddingBottom: 8 }}>
      <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
        <Space wrap>
          <Button
            type="primary"
            onClick={handleGenerateResumeData}
            loading={tailorProfileMutation.isPending}
          >
            Generate Tailored Resume Data
          </Button>

          <Button
            onClick={handleSaveResumeData}
            loading={saveResumeMutation.isPending}
          >
            Save Resume Data
          </Button>
        </Space>

        <Space wrap>
          <Form
            form={form}
            layout="inline"
            initialValues={{
              include_publications: false,
            }}
          >
            <Form.Item
              name="include_publications"
              label="Include Publications"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Form>

          <Button
            variant="solid"
            color="green"
            onClick={handleDownloadResumeDoc}
            loading={generateResumeMutation.isPending}
          >
            Download Doc
          </Button>
        </Space>
      </Flex>

      {experienceSections.map((experience) => (
        <DraggableBulletTable
          key={experience.id}
          title={
            <Space orientation="vertical" size={1}>
              <Typography.Text strong>{experience.title}</Typography.Text>
              <Typography.Text type="secondary">
                {experience.company}
              </Typography.Text>
            </Space>
          }
          rows={experience.bullets}
          onChange={(rows) => updateExperienceBullets(experience.id, rows)}
        />
      ))}

      <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
        {projectSections.map((project) => (
          <DraggableBulletTable
            key={project.id}
            title={<Typography.Text strong>{project.name}</Typography.Text>}
            rows={project.bullets}
            onChange={(rows) => updateProjectBullets(project.id, rows)}
          />
        ))}
      </Space>
    </Space>
  );
}