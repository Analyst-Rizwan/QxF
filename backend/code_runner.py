"""
Sandboxed Python Code Runner
Executes student Python code in a subprocess with timeout and output limits.
"""
import subprocess
import sys
import os
import tempfile
import textwrap


CODE_TIMEOUT = int(os.getenv("CODE_TIMEOUT", "10"))
MAX_OUTPUT_LENGTH = int(os.getenv("MAX_OUTPUT_LENGTH", "5000"))

# Dangerous modules / functions to block
BLOCKED_IMPORTS = [
    "os", "sys", "subprocess", "shutil", "pathlib",
    "socket", "http", "urllib", "requests",
    "importlib", "ctypes", "signal", "threading",
    "multiprocessing", "pickle", "shelve", "sqlite3",
    "__import__", "eval", "exec", "compile",
    "open",  # block file I/O
]

SAFETY_HEADER = textwrap.dedent("""\
import builtins as _builtins

# Block dangerous builtins
_blocked = ['open', 'exec', 'eval', 'compile', '__import__', 'exit', 'quit']
for _b in _blocked:
    if hasattr(_builtins, _b):
        def _raise(*a, **kw): raise PermissionError(f"'{_b}' is not allowed in the sandbox")
        setattr(_builtins, _b, _raise)

# Custom __import__ that blocks dangerous modules
_original_import = _builtins.__dict__.get('__import__')
_blocked_modules = %s

def _safe_import(name, *args, **kwargs):
    if name in _blocked_modules or name.split('.')[0] in _blocked_modules:
        raise ImportError(f"Module '{name}' is not available in the sandbox")
    return _original_import(name, *args, **kwargs)

_builtins.__import__ = _safe_import

# Custom input() that works with pre-provided inputs
_input_queue = []
_original_input = input
def _safe_input(prompt=""):
    if prompt:
        print(prompt, end="")
    if _input_queue:
        val = _input_queue.pop(0)
        print(val)
        return val
    return ""

_builtins.input = _safe_input
""" % repr(BLOCKED_IMPORTS))


def run_python_code(code: str, inputs: list[str] | None = None) -> dict:
    """
    Execute Python code in a sandboxed subprocess.
    Returns {"output": str, "error": str | None, "timeout": bool}
    """
    # Prepare input queue injection
    input_setup = ""
    if inputs:
        import json
        input_setup = f"\n_input_queue = {json.dumps(inputs)}\n"

    full_code = SAFETY_HEADER + input_setup + "\n# ── Student Code ──\n" + code

    try:
        with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False, encoding="utf-8") as f:
            f.write(full_code)
            temp_path = f.name

        result = subprocess.run(
            [sys.executable, "-u", temp_path],
            capture_output=True,
            text=True,
            timeout=CODE_TIMEOUT,
            env={
                "PATH": os.environ.get("PATH", ""),
                "PYTHONHASHSEED": "0",
            },
        )

        stdout = result.stdout[:MAX_OUTPUT_LENGTH] if result.stdout else ""
        stderr = result.stderr[:MAX_OUTPUT_LENGTH] if result.stderr else ""

        if result.returncode != 0:
            # Make error messages student-friendly
            error = _friendly_error(stderr)
            return {"output": stdout, "error": error, "timeout": False}

        return {"output": stdout, "error": None, "timeout": False}

    except subprocess.TimeoutExpired:
        return {
            "output": "",
            "error": f"⏱️ Your code took too long (>{CODE_TIMEOUT}s). Check for infinite loops!",
            "timeout": True,
        }
    except Exception as e:
        return {
            "output": "",
            "error": f"Something went wrong: {str(e)}",
            "timeout": False,
        }
    finally:
        try:
            os.unlink(temp_path)
        except Exception:
            pass


def _friendly_error(stderr: str) -> str:
    """Convert raw Python errors into student-friendly messages."""
    if not stderr:
        return "An unknown error occurred."

    # Get just the last error line(s) — skip traceback
    lines = stderr.strip().split("\n")

    # Find the actual error message
    error_line = ""
    for line in reversed(lines):
        if line and not line.startswith(" ") and not line.startswith("Traceback"):
            error_line = line
            break

    if not error_line:
        error_line = lines[-1] if lines else "Unknown error"

    # Friendly translations
    if "SyntaxError" in error_line:
        return f"📝 Syntax Error: Check your code for missing colons, brackets, or quotation marks.\n\n{error_line}"
    elif "NameError" in error_line:
        return f"❓ Name Error: You used a variable or function that doesn't exist yet.\n\n{error_line}"
    elif "TypeError" in error_line:
        return f"🔄 Type Error: You're trying to mix different types (like text + number).\n\n{error_line}"
    elif "IndentationError" in error_line:
        return f"↔️ Indentation Error: Check your spaces. Python needs consistent indentation.\n\n{error_line}"
    elif "ZeroDivisionError" in error_line:
        return f"💥 Division by Zero: You tried to divide by 0!\n\n{error_line}"
    elif "IndexError" in error_line:
        return f"📏 Index Error: You tried to access an item that doesn't exist in the list.\n\n{error_line}"
    elif "ValueError" in error_line:
        return f"❌ Value Error: The value you used doesn't match what was expected.\n\n{error_line}"
    elif "PermissionError" in error_line:
        return "🔒 That operation is not allowed in the learning sandbox."
    elif "ImportError" in error_line:
        return f"📦 Import Error: That module is not available in the sandbox.\n\n{error_line}"
    else:
        return f"⚠️ Error:\n{error_line}"
