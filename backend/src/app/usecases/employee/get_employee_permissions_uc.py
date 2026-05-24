import logging
from libs.result import Result, Error, Return
from src.app.usecases.employee.commands import (
    GetEmployeePermissionsQuery,
    GetEmployeePermissionsResult,
)

logger = logging.getLogger(__name__)


class GetEmployeePermissionsUseCase:
    def execute(
        self, query: GetEmployeePermissionsQuery, roles: list, permissions: list
    ) -> Result[GetEmployeePermissionsResult, Error]:
        logger.info(f"Getting permissions for user_id={query.user_id}")

        return Return.ok(
            GetEmployeePermissionsResult(
                user_id=query.user_id,
                roles=roles or [],
                permissions=permissions or [],
            )
        )
