# 라꾸 매니저 - Sprint 1 설정 가이드

여기까지 만들어진 것: 로그인 화면 + 인증 골격 + PWA 기본 설정.
아래 순서대로 따라오시면 로그인까지 실제로 동작하는 걸 확인할 수 있습니다.

---

## 1. Supabase 프로젝트 생성

1. https://supabase.com 접속 → 가입/로그인
2. "New Project" 클릭
3. 이름: `rakku-manager` (자유롭게), 리전: `Northeast Asia (Seoul)` 선택
4. DB 비밀번호는 따로 안전한 곳에 저장해두기 (나중에 필요할 수 있음)
5. 프로젝트 생성 완료까지 1~2분 대기

## 2. DB 스키마 실행

1. 왼쪽 메뉴 → **SQL Editor** 클릭
2. "New query"
3. 제가 앞서 드린 `rakku_manager_schema.sql` 내용을 전체 복사해서 붙여넣기
4. 우측 하단 **Run** 클릭
5. 에러 없이 완료되면 왼쪽 메뉴 **Table Editor**에서 `products`, `sales`, `profiles` 등 테이블이 보이는지 확인

## 3. API 키 확인

1. 왼쪽 메뉴 → **Project Settings** → **API**
2. `Project URL` 과 `anon public` 키 두 개를 복사
3. 이 프로젝트의 `js/supabaseClient.js` 파일을 열어서:
   ```js
   const SUPABASE_URL = 'https://YOUR_PROJECT_REF.supabase.co';
   const SUPABASE_ANON_KEY = 'YOUR_ANON_PUBLIC_KEY';
   ```
   이 두 줄을 방금 복사한 값으로 교체

## 4. 첫 관리자 계정 만들기

1. Supabase 대시보드 → **Authentication** → **Users** → **Add user** → **Create new user**
2. 이메일/비밀번호 입력 (본인이 로그인할 계정), **Auto Confirm User** 체크 → 생성
3. 방금 만든 유저의 **User UID**를 복사 (목록에서 클릭하면 보임)
4. **SQL Editor**에서 아래 실행 (UID와 이름은 본인 값으로 교체):
   ```sql
   insert into profiles (id, role, name, status)
   values ('여기에-복사한-UID', 'admin', '대장', 'active');
   ```
5. 이제 이 이메일/비밀번호가 관리자 로그인 계정입니다.

## 5. 로컬에서 실행해보기

브라우저는 보안 정책상 `file://`로 직접 열면 ES Module(`import`)이 막힙니다. 아주 가벼운 로컬 서버가 필요합니다.

**옵션 A: VS Code Live Server 확장** (제일 간단)
- 확장 설치 → `index.html` 우클릭 → "Open with Live Server"

**옵션 B: Node 있으면 터미널에서**
```bash
cd rakku-manager
npx serve .
```
→ 안내되는 주소(예: http://localhost:3000)로 접속

## 6. 확인

1. 브라우저에서 로그인 화면이 뜨는지 확인
2. 4번에서 만든 관리자 계정으로 로그인 시도
3. 성공하면 `/admin/dashboard.html`로 리다이렉트를 시도하는데, **아직 이 페이지는 만들지 않아서 404가 뜨는 게 정상**입니다 (S2에서 만들 예정)
4. 만약 로그인 자체가 실패하면 → 브라우저 개발자도구(F12) Console 탭에서 에러 메시지 확인 후 저에게 알려주세요

---

## 다음 (Sprint 2)
- 관리자: 상품 등록/수정, 창고 재고 조회, 판매자 등록, 재고 지급 화면
- 이 4가지를 만들고 나면 실제로 "상품 등록 → 재고 지급"까지 흐름을 눈으로 확인할 수 있습니다.
