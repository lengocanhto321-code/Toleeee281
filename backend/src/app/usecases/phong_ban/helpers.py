from datetime import datetime


def serialize_model_to_dict(model) -> dict:
    """Convert SQLAlchemy model to dict, removing internal attributes."""
    d = model.__dict__.copy()
    if "_sa_instance_state" in d:
        del d["_sa_instance_state"]
    # Convert datetime objects to ISO format strings
    for key, value in d.items():
        if isinstance(value, datetime):
            d[key] = value.isoformat()
    return d
