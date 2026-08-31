# Releasing to the Chrome Web Store

## 1. Bump the version

`manifest.json` の `version` を上げる（Chrome Web Store は同じバージョン番号の
再アップロードを受け付けない）。1〜4 個の数字をドットで区切った形式のみ有効。

## 2. Build the zip

```sh
node --test "test/*.test.mjs"   # テストを通す
./scripts/package.sh            # -> dist/yakipper-<version>.zip
```

`scripts/package.sh` はリポジトリのルートから zip を作るので、`manifest.json`
が zip の最上位に入る（ここを間違えると Web Store に弾かれる）。`test/`,
`scripts/`, `.github/`, `*.md`, `.DS_Store` は除外される。

## 3. Tag

```sh
git tag v<version> && git push origin v<version>
```

`.github/workflows/release.yml` がタグと `manifest.json` のバージョン一致を確認し、
zip を作って GitHub Release に添付する。

## 4. Upload

[Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
→ 対象アイテム → **Package** → **Upload new package** で zip をアップロードし、
**Submit for review**。初回のみ登録料 $5 とストア掲載情報（説明文、スクリーンショット
1280x800 か 640x400、128x128 アイコン、プライバシー慣行の申告）が必要。

`tabs` / `storage` 権限と `https://*/*` のホストアクセスを使っているので、審査時に
それぞれの用途説明を求められる。用途を書いておくと審査が早い。

## 5. (任意) アップロードの自動化

手作業をなくすなら Chrome Web Store API を使う。Google Cloud で OAuth クライアントを
作り、`CWS_CLIENT_ID` / `CWS_CLIENT_SECRET` / `CWS_REFRESH_TOKEN` / `CWS_EXTENSION_ID`
を GitHub Secrets に入れて、release ワークフローに公開ステップを足す。
まずは手動アップロードで運用し、リリース頻度が上がってから入れるのがおすすめ。
