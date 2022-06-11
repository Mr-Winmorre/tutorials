# from opentelemetry import trace
# from opentelemetry.sdk.trace import TracerProvider
# from opentelemetry.sdk.trace.export import (
#     BatchSpanProcessor,
#     ConsoleSpanExporter,
# )
from distutils.log import info
# from structlog.stdlib.sys import 
import logging
import structlog 
import traceback


# provider = TracerProvider()
# processor = BatchSpanProcessor(ConsoleSpanExporter())
# provider.add_span_processor(processor)
# trace.set_tracer_provider(provider)
# tracer = trace.get_tracer(__name__)
timestamper = structlog.processors.TimeStamper(fmt="%Y-%m-%d %H:%M:%S")
pre_chain = [
    structlog.stdlib.add_log_level,
    timestamper,
]
filename = "logfile.log"
logging.basicConfig(
    filename=filename,
    format="%(message)s",
    level=logging.INFO,
)

# logging.config.dictConfig({
#             "version": 1,
#             "disable_existing_loggers": False,
#             "formatters": {
#                 "plain": {
#                     "()": structlog.stdlib.ProcessorFormatter,
#                     "processor": structlog.dev.ConsoleRenderer(colors=False),
#                     "foreign_pre_chain": pre_chain,
#                 },
#                 "colored": {
#                     "()": structlog.stdlib.ProcessorFormatter,
#                     "processor": structlog.dev.ConsoleRenderer(colors=True),
#                     "foreign_pre_chain": pre_chain,
#                 },
#             },
#             "handlers": {
#                 "default": {
#                     "level": "DEBUG",
#                     "class": "logging.StreamHandler",
#                     "formatter": "colored",
#                 },
#                 "file": {
#                     "level": "DEBUG",
#                     "class": "logging.handlers.WatchedFileHandler",
#                     "filename": filename + ".log",
#                     "formatter": "plain",
#                 },
#             },
#             "loggers": {
#                 "": {
#                     "handlers": ["default", "file"],
#                     "level": "DEBUG",
#                     "propagate": True,
#                 },
#             }
#     })

def set_exc_trace(logger,name,event_dict):
    print(logger,end="\n")
    print(name,end="\n")
    print(event_dict,end="\n")

    return event_dict


structlog.configure(
    processors=[
        structlog.stdlib.add_log_level,
        # structlog.stdlib.sys.settrace,
        structlog.stdlib.add_logger_name,
        structlog.processors.StackInfoRenderer(),
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.dev.set_exc_info,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.format_exc_info,

        # structlog.processors.CallsiteParameterAdder(
        #     parameters=[
        #         CallsiteParameter.FILENAME,
        #         CallsiteParameter.FUNC_NAME,
        #         CallsiteParameter.LINENO,
        #         CallsiteParameter.PROCESS_NAME,
        #         CallsiteParameter.PATHNAME,
        #     ]
        # ),
        # structlog.dev.ConsoleRenderer(),
        structlog.processors.JSONRenderer(),
        set_exc_trace
    ],
    wrapper_class=structlog.make_filtering_bound_logger(logging.NOTSET),
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    # wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

LOGGER = structlog.get_logger(__name__)


def do_the_math():
    n = [0, 9, 8, 7]
    try:
        value = n[4]
        return value
    except Exception as e:
        LOGGER.info("Do the Math Error::",traceback=traceback.format_exc())


def divide_by_zero():
    try:
        a = 100 / 0
        return a
    except Exception as e:
        LOGGER.info("Divide by zero error",traceback=traceback.format_exc())


if __name__ == '__main__':
    divide_by_zero()
    do_the_math()
