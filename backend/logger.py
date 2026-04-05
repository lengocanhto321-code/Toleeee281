import logging
import sys

from asgi_correlation_id import CorrelationIdFilter

LOGGING_VALID_LEVELS = {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}


class Colors:
    RESET = "\033[0m"
    GREY = "\033[90m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    RED_BOLD = "\033[91;1m"
    CYAN = "\033[96m"
    BLUE = "\033[94m"


class ColoredFormatter(logging.Formatter):
    LEVEL_COLORS = {
        "DEBUG": Colors.GREY,
        "INFO": Colors.GREEN,
        "WARNING": Colors.YELLOW,
        "ERROR": Colors.RED,
        "CRITICAL": Colors.RED_BOLD,
    }

    def format(self, record):
        level_color = self.LEVEL_COLORS.get(record.levelname, Colors.RESET)
        colored_level = f"{level_color}{record.levelname}{Colors.RESET}"

        timestamp = self.formatTime(record, "%Y-%m-%d %H:%M:%S")
        correlation_id = getattr(record, "correlation_id", "-")

        main_line = (
            f"{Colors.BLUE}{timestamp}{Colors.RESET} "
            f"[{Colors.CYAN}{correlation_id}{Colors.RESET}] "
            f"{colored_level} "
            f"{record.getMessage()}"
        )

        extra_lines = []
        if record.name != "__main__":
            extra_lines.append(
                f"       {Colors.GREY}logger: {record.name}{Colors.RESET}"
            )
        if record.funcName:
            extra_lines.append(
                f"       {Colors.GREY}location: {record.funcName}:{record.lineno}{Colors.RESET}"
            )

        # Exception info
        if record.exc_info:
            exc_text = self.formatException(record.exc_info)
            extra_lines.append(f"       {Colors.RED}{exc_text}{Colors.RESET}")

        if extra_lines:
            return main_line + "\n" + "\n".join(extra_lines)
        return main_line


def setup_app_level_logger(level: str = "INFO") -> logging.Logger:
    if level not in LOGGING_VALID_LEVELS:
        raise ValueError(
            f"'{level}' is not a valid logging level. Valid levels: {LOGGING_VALID_LEVELS}"
        )
    level = logging.getLevelName(level)

    logger = logging.getLogger()
    logger.setLevel(level)
    logger.handlers.clear()

    if sys.stdout.isatty():
        formatter = ColoredFormatter()
    else:
        formatter = logging.Formatter(
            "%(asctime)s [%(correlation_id)s] %(levelname)s %(name)s - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )

    stream_handler = logging.StreamHandler()
    stream_handler.addFilter(CorrelationIdFilter(default_value="-", uuid_length=32))
    stream_handler.setFormatter(formatter)
    stream_handler.setLevel(level)

    logger.addHandler(stream_handler)
    return logger
