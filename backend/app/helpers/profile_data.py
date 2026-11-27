from sqlalchemy import text
from sqlalchemy.orm import Session


def fetch_full_profile(db: Session) -> dict:
    skill_groups = [
        dict(r._mapping)
        for r in db.execute(text("""
            SELECT id, title, position FROM skill_groups
            ORDER BY position ASC, title ASC
        """))
    ]
    for g in skill_groups:
        rows = db.execute(text("""
            SELECT id, skill_group_id, name, position FROM skills
            WHERE skill_group_id = :gid ORDER BY position ASC, name ASC
        """), {"gid": g["id"]})
        g["skills"] = [dict(r._mapping) for r in rows]

    experiences = [
        dict(r._mapping)
        for r in db.execute(text("""
            SELECT id, title, company, location, start_date, end_date, description, position
            FROM experiences ORDER BY position ASC, start_date DESC
        """))
    ]
    for e in experiences:
        rows = db.execute(text("""
            SELECT id, experience_id, content, position FROM exp_bullets
            WHERE experience_id = :eid ORDER BY position ASC
        """), {"eid": e["id"]})
        e["bullets"] = [dict(r._mapping) for r in rows]

    projects = [
        dict(r._mapping)
        for r in db.execute(text("""
            SELECT id, name, start_date, end_date, stack, links, description, position
            FROM projects ORDER BY position ASC, start_date DESC
        """))
    ]
    for p in projects:
        rows = db.execute(text("""
            SELECT id, project_id, content, position FROM proj_bullets
            WHERE project_id = :pid ORDER BY position ASC
        """), {"pid": p["id"]})
        p["bullets"] = [dict(r._mapping) for r in rows]

    return {"skill_groups": skill_groups, "experiences": experiences, "projects": projects}


def format_profile_as_text(profile: dict, education: list[dict]) -> str:
    lines: list[str] = []

    lines.append("EDUCATION")
    for edu in education:
        lines.append(f"{edu['degree']}, {edu['institution']} ({edu['date']})")

    lines.append("\nSKILLS")
    for g in profile["skill_groups"]:
        lines.append(f"{g['title']}: {', '.join(s['name'] for s in g['skills'])}")

    lines.append("\nEXPERIENCE")
    for e in profile["experiences"]:
        header = f"{e['title']}, {e['company']}"
        if e.get("location"):
            header += f"; {e['location']}"
        lines.append(f"{header} ({e.get('start_date', '')} - {e.get('end_date', '')})")
        if e.get("description"):
            lines.append(e["description"])
        lines.extend(f"- {b['content']}" for b in e["bullets"])

    lines.append("\nPROJECTS")
    for p in profile["projects"]:
        lines.append(f"{p['name']} ({p.get('start_date') or ''} - {p.get('end_date') or ''})")
        if p.get("stack"):
            lines.append(f"Stack: {p['stack']}")
        if p.get("description"):
            lines.append(p["description"])
        lines.extend(f"- {b['content']}" for b in p["bullets"])

    return "\n".join(lines).strip()