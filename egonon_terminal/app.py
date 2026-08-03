from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

from .config import load_json, workspace_root


def check_configuration(root: Path) -> dict:
    registry = load_json(root / "engine-registry.json", {})
    policy = load_json(root / "project-policy.json", {})
    errors: list[str] = []
    if not registry:
        errors.append("missing engine-registry.json")
    if policy.get("live_trading_enabled") is not False:
        errors.append("live trading must remain disabled")
    return {"status": "PASS" if not errors else "FAIL", "root": str(root), "errors": errors}


def create_app(root: Path):
    from dash import Dash, Input, Output, dcc, html

    app = Dash(__name__, title="EGONON Terminal", suppress_callback_exceptions=True, assets_folder=str(Path(__file__).with_name("assets")))

    def snapshot():
        registry = load_json(root / "engine-registry.json", {"engines": {}})
        return registry.get("engines", {}), registry.get("egonon_terminal", {}).get("components", {})

    def cards(items):
        return [html.Div([html.H4(name), html.P(data.get("role", "")), html.Strong(data.get("status", "UNKNOWN"))], className="engine-card") for name, data in items.items()] or [html.P("No components registered yet.")]

    app.layout = html.Div([
        html.Header([html.H1("EGONON Terminal"), html.P("Finance, portfolio, AI-quant and data engines orchestrated by EGONON OS")]),
        dcc.Tabs(id="tabs", value="overview", children=[
            dcc.Tab(label="Overview", value="overview"), dcc.Tab(label="Analytics", value="analytics"), dcc.Tab(label="Portfolio Lab", value="portfolio"), dcc.Tab(label="AI Quant Lab", value="qlib"), dcc.Tab(label="Data Gateway", value="gateway"), dcc.Tab(label="Shared Memory", value="memory")]),
        html.Div(id="tab-content"), dcc.Interval(id="refresh", interval=15_000, n_intervals=0)], className="shell")

    @app.callback(Output("tab-content", "children"), Input("tabs", "value"), Input("refresh", "n_intervals"))
    def render_tab(tab, _):
        current_engines, current_terminal = snapshot()
        if tab == "overview":
            return html.Div([html.H2("Control plane"), html.Div(cards(current_terminal), className="card-grid"), html.H3("Research engines"), html.Div(cards(current_engines), className="card-grid")])
        if tab == "analytics":
            return html.Div([html.H2("Analytics"), html.P("FinanceToolkit, FinanceDatabase and jQuantStats."), html.Pre(json.dumps(current_terminal.get("egonon-terminal-ui", {}), indent=2))])
        if tab == "portfolio":
            return html.Div([html.H2("Portfolio Lab"), html.P("skfolio and Riskfolio-Lib in an isolated environment."), html.Pre(json.dumps(current_terminal.get("portfolio-lab", {}), indent=2))])
        if tab == "qlib":
            return html.Div([html.H2("AI Quant Lab"), html.P("Qlib isolated from the dashboard runtime."), html.Pre(json.dumps(current_terminal.get("qlib-lab", {}), indent=2))])
        if tab == "gateway":
            return html.Div([html.H2("Data Gateway"), html.P("OpenBB is optional, isolated and replaceable."), html.Pre(json.dumps(current_terminal.get("openbb-gateway", {}), indent=2))])
        return html.Div([html.H2("Shared Memory"), html.Pre(json.dumps(load_json(root / "memory" / "index.json", {}), indent=2))])

    return app


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=None)
    parser.add_argument("--host", default=os.environ.get("EGONON_TERMINAL_HOST", "127.0.0.1"))
    parser.add_argument("--port", type=int, default=int(os.environ.get("EGONON_TERMINAL_PORT", "8050")))
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    root = workspace_root(args.root)
    if args.check:
        result = check_configuration(root)
        print(json.dumps(result, sort_keys=True))
        raise SystemExit(0 if result["status"] == "PASS" else 1)
    create_app(root).run(host=args.host, port=args.port, debug=False)


if __name__ == "__main__":
    main()
