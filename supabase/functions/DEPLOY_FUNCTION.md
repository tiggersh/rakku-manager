# Edge Function 배포 가이드 (manage-users)

## 1. Supabase CLI 설치 (VS Code 터미널에서)

```bash
npm install -g supabase
```

설치 확인:
```bash
supabase --version
```

## 2. 로그인 및 프로젝트 연결

```bash
supabase login
```
→ 브라우저 열리면 로그인/승인

```bash
supabase link --project-ref YOUR_PROJECT_REF
```
`YOUR_PROJECT_REF`는 Supabase 프로젝트 URL의 `https://xxxxx.supabase.co`에서 `xxxxx` 부분입니다.
(Supabase 대시보드 → Project Settings → General → Reference ID에서도 확인 가능)

## 3. 함수 배포

프로젝트 폴더(`rakku-manager`) 최상위에서:

```bash
supabase functions deploy manage-users
```

성공하면 배포 완료 메시지가 뜹니다.

## 4. 환경변수(secret) 확인

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`는
Supabase가 Edge Function에 **자동으로** 제공하는 값이라 따로 등록 안 하셔도 됩니다.

## 5. 테스트

Supabase 대시보드 → 왼쪽 메뉴 **Edge Functions** → `manage-users` 클릭 →
**Logs** 탭에서 호출 기록이 보이면 정상 배포된 것입니다.

실제 테스트는 앱에서 판매자 등록 화면으로 바로 하시면 됩니다 (다음 단계에서 화면 안내).
