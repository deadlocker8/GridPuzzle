FROM python:3.9-slim-bullseye

RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

RUN curl -sSL https://install.python-poetry.org | python -
COPY . /opt/GridPuzzle
RUN rm /opt/GridPuzzle/settings.json

WORKDIR /opt/GridPuzzle
RUN /root/.local/bin/poetry install --no-root && \
    /root/.local/bin/poetry cache clear --all .
RUN ln -s $($HOME/.local/share/pypoetry/venv/bin/poetry env info -p) /opt/GridPuzzle/myvenv

WORKDIR /opt/GridPuzzle/src
CMD [ "/opt/GridPuzzle/myvenv/bin/python", "/opt/GridPuzzle/src/GridPuzzle.py"]
