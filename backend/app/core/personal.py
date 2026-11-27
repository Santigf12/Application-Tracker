"""
personal.py
Single source of truth for static personal info used by the resume builder,
cover letter builder, and AI tooling.
"""

PERSONAL = {
    "name": "Santiago Fuentes",
    "phone": "(825) 365-0075",
    "email": "jobs@fuentes.it.com",
    "location": "Calgary, Alberta, T3C 1N6",
    "links": [
        {"label": "GitHub", "url": "https://github.com/Santigf12"},
        {"label": "Personal", "url": "https://santigf12.github.io/"},
    ],
}

EDUCATION = [
    {
        "degree": "Bachelor of Science in Software Engineering",
        "institution": "Schulich School of Engineering, University of Calgary | Calgary, Alberta",
        "date": "Graduated May 2026.",
    }
]

PUBLICATIONS = [
    {
        "citation": (
            "Atkin, D., Fuentes, S., & Yadid-Pecht, O. (2025). "
            "Women in Entrepreneurship: Effective Strategies for Online "
            "Training and Development. International Journal of Innovative "
            "Business Strategies, 11(1), 782–789."
        ),
        "url": "https://doi.org/10.20533/ijibs.2046.3626.2025.0096",
    }
]