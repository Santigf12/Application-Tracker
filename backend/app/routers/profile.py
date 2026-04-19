from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.schemas.profile import (
    SkillGroupCreate,
    SkillGroupUpdate,
    SkillCreate,
    SkillUpdate,
    ExperienceCreate,
    ExperienceUpdate,
    ProjectCreate,
    ProjectUpdate,
)

router = APIRouter()


@router.get("/")
def get_full_profile(db: Session = Depends(get_db)):
    try:
        skill_groups_query = text("""
            SELECT id, title, position
            FROM skill_groups
            ORDER BY position ASC, title ASC;
        """)
        skill_groups = [dict(row._mapping) for row in db.execute(skill_groups_query)]

        for group in skill_groups:
            skills_query = text("""
                SELECT id, skill_group_id, name, position
                FROM skills
                WHERE skill_group_id = :skill_group_id
                ORDER BY position ASC, name ASC;
            """)
            skills = db.execute(skills_query, {"skill_group_id": group["id"]})
            group["skills"] = [dict(row._mapping) for row in skills]

        experiences_query = text("""
            SELECT
                id,
                title,
                company,
                location,
                start_date,
                end_date,
                description,
                position
            FROM experiences
            ORDER BY position ASC, start_date DESC;
        """)
        experiences = [dict(row._mapping) for row in db.execute(experiences_query)]

        for exp in experiences:
            bullets_query = text("""
                SELECT id, experience_id, content, position
                FROM exp_bullets
                WHERE experience_id = :experience_id
                ORDER BY position ASC;
            """)
            bullets = db.execute(bullets_query, {"experience_id": exp["id"]})
            exp["bullets"] = [dict(row._mapping) for row in bullets]

        projects_query = text("""
            SELECT
                id,
                name,
                start_date,
                end_date,
                stack,
                links,
                description,
                position
            FROM projects
            ORDER BY position ASC, start_date DESC;
        """)
        projects = [dict(row._mapping) for row in db.execute(projects_query)]

        for project in projects:
            bullets_query = text("""
                SELECT id, project_id, content, position
                FROM proj_bullets
                WHERE project_id = :project_id
                ORDER BY position ASC;
            """)
            bullets = db.execute(bullets_query, {"project_id": project["id"]})
            project["bullets"] = [dict(row._mapping) for row in bullets]

        return {
            "skill_groups": skill_groups,
            "experiences": experiences,
            "projects": projects,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------
# Skill Groups
# ---------------------------

@router.get("/skill-groups")
def get_skill_groups(db: Session = Depends(get_db)):
    try:
        query = text("""
            SELECT id, title, position
            FROM skill_groups
            ORDER BY position ASC, title ASC;
        """)
        rows = [dict(row._mapping) for row in db.execute(query)]
        return rows
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/skill-groups")
def create_skill_group(payload: SkillGroupCreate, db: Session = Depends(get_db)):
    try:
        query = text("""
            INSERT INTO skill_groups (title, position)
            VALUES (:title, :position);
        """)
        db.execute(query, {
            "title": payload.title,
            "position": payload.position,
        })
        db.commit()
        return {"success": True, "message": "Skill group created"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/skill-groups/{id}")
def update_skill_group(id: str, payload: SkillGroupUpdate, db: Session = Depends(get_db)):
    try:
        query = text("""
            UPDATE skill_groups
            SET title = :title,
                position = :position
            WHERE id = :id;
        """)
        db.execute(query, {
            "id": id,
            "title": payload.title,
            "position": payload.position,
        })
        db.commit()
        return {"success": True, "message": "Skill group updated"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/skill-groups/{id}")
def delete_skill_group(id: str, db: Session = Depends(get_db)):
    try:
        query = text("""
            DELETE FROM skill_groups
            WHERE id = :id;
        """)
        db.execute(query, {"id": id})
        db.commit()
        return {"success": True, "message": "Skill group deleted"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------
# Skills
# ---------------------------

@router.get("/skills")
def get_skills(db: Session = Depends(get_db)):
    try:
        query = text("""
            SELECT id, skill_group_id, name, position
            FROM skills
            ORDER BY position ASC, name ASC;
        """)
        rows = [dict(row._mapping) for row in db.execute(query)]
        return rows
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/skills")
def create_skill(payload: SkillCreate, db: Session = Depends(get_db)):
    try:
        query = text("""
            INSERT INTO skills (skill_group_id, name, position)
            VALUES (:skill_group_id, :name, :position);
        """)
        db.execute(query, {
            "skill_group_id": payload.skill_group_id,
            "name": payload.name,
            "position": payload.position,
        })
        db.commit()
        return {"success": True, "message": "Skill created"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/skills/{id}")
def update_skill(id: str, payload: SkillUpdate, db: Session = Depends(get_db)):
    try:
        query = text("""
            UPDATE skills
            SET skill_group_id = :skill_group_id,
                name = :name,
                position = :position
            WHERE id = :id;
        """)
        db.execute(query, {
            "id": id,
            "skill_group_id": payload.skill_group_id,
            "name": payload.name,
            "position": payload.position,
        })
        db.commit()
        return {"success": True, "message": "Skill updated"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/skills/{id}")
def delete_skill(id: str, db: Session = Depends(get_db)):
    try:
        query = text("""
            DELETE FROM skills
            WHERE id = :id;
        """)
        db.execute(query, {"id": id})
        db.commit()
        return {"success": True, "message": "Skill deleted"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------
# Experiences
# ---------------------------

@router.get("/experiences")
def get_all_experiences(db: Session = Depends(get_db)):
    try:
        query = text("""
            SELECT
                id,
                title,
                company,
                location,
                start_date,
                end_date,
                description,
                position
            FROM experiences
            ORDER BY position ASC, start_date DESC;
        """)
        experiences = [dict(row._mapping) for row in db.execute(query)]

        for exp in experiences:
            bullets_query = text("""
                SELECT id, experience_id, content, position
                FROM exp_bullets
                WHERE experience_id = :experience_id
                ORDER BY position ASC;
            """)
            bullets = db.execute(bullets_query, {"experience_id": exp["id"]})
            exp["bullets"] = [dict(row._mapping) for row in bullets]

        return experiences
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/experiences/{id}")
def get_experience_by_id(id: str, db: Session = Depends(get_db)):
    try:
        query = text("""
            SELECT
                id,
                title,
                company,
                location,
                start_date,
                end_date,
                description,
                position
            FROM experiences
            WHERE id = :id;
        """)
        result = db.execute(query, {"id": id}).fetchone()

        if not result:
            raise HTTPException(status_code=404, detail="Experience not found")

        experience = dict(result._mapping)

        bullets_query = text("""
            SELECT id, experience_id, content, position
            FROM exp_bullets
            WHERE experience_id = :experience_id
            ORDER BY position ASC;
        """)
        bullets = db.execute(bullets_query, {"experience_id": id})
        experience["bullets"] = [dict(row._mapping) for row in bullets]

        return experience
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/experiences")
def create_experience(payload: ExperienceCreate, db: Session = Depends(get_db)):
    try:
        insert_experience = text("""
            INSERT INTO experiences (
                title,
                company,
                location,
                start_date,
                end_date,
                description,
                position
            )
            VALUES (
                :title,
                :company,
                :location,
                :start_date,
                :end_date,
                :description,
                :position
            );
        """)

        db.execute(insert_experience, {
            "title": payload.title,
            "company": payload.company,
            "location": payload.location,
            "start_date": payload.start_date,
            "end_date": payload.end_date,
            "description": payload.description,
            "position": payload.position,
        })

        exp_id_result = db.execute(text("SELECT UUID() AS id;")).fetchone()
        created_id = exp_id_result._mapping["id"]

        # Better option if you generate UUID in Python instead of SQL.
        # See note below.

        db.execute(text("""
            UPDATE experiences
            SET id = :id
            WHERE title = :title
              AND company = :company
              AND position = :position
            ORDER BY position
            LIMIT 1;
        """), {
            "id": created_id,
            "title": payload.title,
            "company": payload.company,
            "position": payload.position,
        })

        for bullet in payload.bullets or []:
            insert_bullet = text("""
                INSERT INTO exp_bullets (experience_id, content, position)
                VALUES (:experience_id, :content, :position);
            """)
            db.execute(insert_bullet, {
                "experience_id": created_id,
                "content": bullet.content,
                "position": bullet.position,
            })

        db.commit()
        return {"success": True, "message": "Experience created"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/experiences/{id}")
def update_experience(id: str, payload: ExperienceUpdate, db: Session = Depends(get_db)):
    try:
        update_query = text("""
            UPDATE experiences
            SET
                title = :title,
                company = :company,
                location = :location,
                start_date = :start_date,
                end_date = :end_date,
                description = :description,
                position = :position
            WHERE id = :id;
        """)

        db.execute(update_query, {
            "id": id,
            "title": payload.title,
            "company": payload.company,
            "location": payload.location,
            "start_date": payload.start_date,
            "end_date": payload.end_date,
            "description": payload.description,
            "position": payload.position,
        })

        db.execute(text("DELETE FROM exp_bullets WHERE experience_id = :experience_id;"), {
            "experience_id": id
        })

        for bullet in payload.bullets or []:
            insert_bullet = text("""
                INSERT INTO exp_bullets (experience_id, content, position)
                VALUES (:experience_id, :content, :position);
            """)
            db.execute(insert_bullet, {
                "experience_id": id,
                "content": bullet.content,
                "position": bullet.position,
            })

        db.commit()
        return {"success": True, "message": "Experience updated"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/experiences/{id}")
def delete_experience(id: str, db: Session = Depends(get_db)):
    try:
        query = text("""
            DELETE FROM experiences
            WHERE id = :id;
        """)
        db.execute(query, {"id": id})
        db.commit()
        return {"success": True, "message": "Experience deleted"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------
# Projects
# ---------------------------

@router.get("/projects")
def get_all_projects(db: Session = Depends(get_db)):
    try:
        query = text("""
            SELECT
                id,
                name,
                start_date,
                end_date,
                stack,
                links,
                description,
                position
            FROM projects
            ORDER BY position ASC, start_date DESC;
        """)
        projects = [dict(row._mapping) for row in db.execute(query)]

        for project in projects:
            bullets_query = text("""
                SELECT id, project_id, content, position
                FROM proj_bullets
                WHERE project_id = :project_id
                ORDER BY position ASC;
            """)
            bullets = db.execute(bullets_query, {"project_id": project["id"]})
            project["bullets"] = [dict(row._mapping) for row in bullets]

        return projects
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/projects/{id}")
def get_project_by_id(id: str, db: Session = Depends(get_db)):
    try:
        query = text("""
            SELECT
                id,
                name,
                start_date,
                end_date,
                stack,
                links,
                description,
                position
            FROM projects
            WHERE id = :id;
        """)
        result = db.execute(query, {"id": id}).fetchone()

        if not result:
            raise HTTPException(status_code=404, detail="Project not found")

        project = dict(result._mapping)

        bullets_query = text("""
            SELECT id, project_id, content, position
            FROM proj_bullets
            WHERE project_id = :project_id
            ORDER BY position ASC;
        """)
        bullets = db.execute(bullets_query, {"project_id": id})
        project["bullets"] = [dict(row._mapping) for row in bullets]

        return project
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/projects")
def create_project(payload: ProjectCreate, db: Session = Depends(get_db)):
    try:
        insert_project = text("""
            INSERT INTO projects (
                name,
                start_date,
                end_date,
                stack,
                links,
                description,
                position
            )
            VALUES (
                :name,
                :start_date,
                :end_date,
                :stack,
                :links,
                :description,
                :position
            );
        """)

        db.execute(insert_project, {
            "name": payload.name,
            "start_date": payload.start_date,
            "end_date": payload.end_date,
            "stack": payload.stack,
            "links": payload.links,
            "description": payload.description,
            "position": payload.position,
        })

        project_id_result = db.execute(text("SELECT UUID() AS id;")).fetchone()
        created_id = project_id_result._mapping["id"]

        db.execute(text("""
            UPDATE projects
            SET id = :id
            WHERE name = :name
              AND position = :position
            ORDER BY position
            LIMIT 1;
        """), {
            "id": created_id,
            "name": payload.name,
            "position": payload.position,
        })

        for bullet in payload.bullets or []:
            insert_bullet = text("""
                INSERT INTO proj_bullets (project_id, content, position)
                VALUES (:project_id, :content, :position);
            """)
            db.execute(insert_bullet, {
                "project_id": created_id,
                "content": bullet.content,
                "position": bullet.position,
            })

        db.commit()
        return {"success": True, "message": "Project created"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/projects/{id}")
def update_project(id: str, payload: ProjectUpdate, db: Session = Depends(get_db)):
    try:
        update_query = text("""
            UPDATE projects
            SET
                name = :name,
                start_date = :start_date,
                end_date = :end_date,
                stack = :stack,
                links = :links,
                description = :description,
                position = :position
            WHERE id = :id;
        """)

        db.execute(update_query, {
            "id": id,
            "name": payload.name,
            "start_date": payload.start_date,
            "end_date": payload.end_date,
            "stack": payload.stack,
            "links": payload.links,
            "description": payload.description,
            "position": payload.position,
        })

        db.execute(text("DELETE FROM proj_bullets WHERE project_id = :project_id;"), {
            "project_id": id
        })

        for bullet in payload.bullets or []:
            insert_bullet = text("""
                INSERT INTO proj_bullets (project_id, content, position)
                VALUES (:project_id, :content, :position);
            """)
            db.execute(insert_bullet, {
                "project_id": id,
                "content": bullet.content,
                "position": bullet.position,
            })

        db.commit()
        return {"success": True, "message": "Project updated"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/projects/{id}")
def delete_project(id: str, db: Session = Depends(get_db)):
    try:
        query = text("""
            DELETE FROM projects
            WHERE id = :id;
        """)
        db.execute(query, {"id": id})
        db.commit()
        return {"success": True, "message": "Project deleted"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))