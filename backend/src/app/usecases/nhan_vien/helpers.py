from datetime import datetime, date
from decimal import Decimal

from libs.datetime import serialize_dt


def serialize_model_to_dict(model) -> dict:
    d = {c.key: getattr(model, c.key) for c in model.__table__.columns}
    for key, value in d.items():
        if isinstance(value, datetime):
            d[key] = serialize_dt(value)
        elif isinstance(value, date):
            d[key] = value.isoformat()
        elif isinstance(value, Decimal):
            d[key] = float(value)
    return d
