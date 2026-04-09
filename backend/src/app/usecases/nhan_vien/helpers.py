from datetime import datetime, date
from decimal import Decimal


def serialize_model_to_dict(model) -> dict:
    """Convert SQLAlchemy model to dict, keeping only table columns with JSON-safe values."""
    d = {c.key: getattr(model, c.key) for c in model.__table__.columns}
    for key, value in d.items():
        if isinstance(value, (datetime, date)):
            d[key] = value.isoformat()
        elif isinstance(value, Decimal):
            d[key] = float(value)
    return d
