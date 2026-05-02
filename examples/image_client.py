#!/usr/bin/env python3
import argparse
import base64
import mimetypes
import os
from pathlib import Path

import requests

API_BASE = "https://api.freetheai.xyz/v1"
MODEL = "img/gpt-image-2"


def api_key() -> str:
    key = os.getenv("FREETHEAI_API_KEY", "").strip()
    if not key:
        raise RuntimeError("Set FREETHEAI_API_KEY first.")
    return key


def image_to_data_url(path: str) -> str:
    image_path = Path(path)
    data = image_path.read_bytes()
    mime = mimetypes.guess_type(image_path.name)[0] or "image/png"
    encoded = base64.b64encode(data).decode("ascii")
    return f"data:{mime};base64,{encoded}"


def post_image(path: str, payload: dict) -> dict:
    res = requests.post(
        f"{API_BASE}{path}",
        headers={
            "Authorization": f"Bearer {api_key()}",
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=180,
    )

    try:
        data = res.json()
    except Exception:
        raise RuntimeError(f"HTTP {res.status_code}: {res.text[:500]}")

    if res.status_code != 200:
        raise RuntimeError(f"HTTP {res.status_code}: {data}")

    return data


def save_b64_image(response: dict, out_path: str) -> None:
    items = response.get("data") or []
    if not items or not items[0].get("b64_json"):
        raise RuntimeError(f"No b64_json image in response: {response}")

    image_bytes = base64.b64decode(items[0]["b64_json"])
    Path(out_path).write_bytes(image_bytes)


def generate(prompt: str, out_path: str) -> None:
    response = post_image(
        "/images/generations",
        {
            "model": MODEL,
            "prompt": prompt,
        },
    )
    save_b64_image(response, out_path)


def edit(prompt: str, image_path: str, out_path: str) -> None:
    response = post_image(
        "/images/edits",
        {
            "model": MODEL,
            "prompt": prompt,
            "image": image_to_data_url(image_path),
        },
    )
    save_b64_image(response, out_path)


def main() -> None:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="cmd", required=True)

    gen = sub.add_parser("generate")
    gen.add_argument("prompt")
    gen.add_argument("--out", default="generated.png")

    edt = sub.add_parser("edit")
    edt.add_argument("prompt")
    edt.add_argument("--image", required=True)
    edt.add_argument("--out", default="edited.png")

    args = parser.parse_args()

    if args.cmd == "generate":
        generate(args.prompt, args.out)
        print(f"Saved generated image to {args.out}")
    elif args.cmd == "edit":
        edit(args.prompt, args.image, args.out)
        print(f"Saved edited image to {args.out}")


if __name__ == "__main__":
    main()
