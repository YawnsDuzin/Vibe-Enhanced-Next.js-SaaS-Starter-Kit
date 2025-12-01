# 프로젝트 구조

이 문서는 Vibe SaaS 스타터 킷의 폴더 구조와 각 파일의 역할을 설명합니다.

## 전체 폴더 구조

```
vibe-saas-starter/
├── docs/                          # 문서
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (auth)/               # 인증 관련 페이지 (그룹)
│   │   ├── (dashboard)/          # 대시보드 페이지 (그룹)
│   │   ├── api/                  # API 라우트
│   │   ├── auth/                 # 인증 콜백
│   │   ├── globals.css           # 전역 스타일
│   │   ├── layout.tsx            # 루트 레이아웃
│   │   └── page.tsx              # 랜딩 페이지
│   ├── components/
│   │   ├── layout/               # 레이아웃 컴포넌트
│   │   ├── ui/                   # UI 컴포넌트 (shadcn/ui)
│   │   └── providers.tsx         # 전역 Provider
│   ├── lib/                      # 유틸리티 라이브러리
│   │   ├── payments/             # 결제 시스템
│   │   ├── supabase/             # Supabase 클라이언트
│   │   ├── auth.ts               # 인증 유틸리티
│   │   ├── rbac.ts               # 역할 기반 접근 제어
│   │   ├── stripe.ts             # Stripe 설정
│   │   └── utils.ts              # 공통 유틸리티
│   ├── types/                    # TypeScript 타입
│   └── middleware.ts             # Next.js 미들웨어
├── supabase/
│   ├── migrations/               # 데이터베이스 마이그레이션
│   └── seed.sql                  # 초기 데이터
├── .env.example                  # 환경 변수 예시
├── package.json                  # 의존성 설정
├── tailwind.config.ts            # Tailwind CSS 설정
├── tsconfig.json                 # TypeScript 설정
└── vercel.json                   # Vercel 배포 설정
```

---

## 상세 파일 설명

### 루트 설정 파일

| 파일 | 설명 |
|------|------|
| `package.json` | npm 의존성 및 스크립트 정의 |
| `tsconfig.json` | TypeScript 컴파일러 설정, 경로 별칭 (`@/`) |
| `tailwind.config.ts` | Tailwind CSS 테마, 색상, 플러그인 설정 |
| `postcss.config.js` | PostCSS 설정 (Tailwind 처리) |
| `.eslintrc.json` | ESLint 규칙 설정 |
| `vercel.json` | Vercel 배포 옵션, 헤더, 리다이렉트 설정 |
| `.env.example` | 환경 변수 템플릿 |

---

### src/app/ (App Router)

Next.js 14 App Router 구조를 사용합니다. 괄호 `()`는 URL에 영향을 주지 않는 라우트 그룹입니다.

#### 루트 파일

| 파일 | 설명 |
|------|------|
| `layout.tsx` | 루트 레이아웃 - 폰트, 메타데이터, 전역 Provider 설정 |
| `page.tsx` | 랜딩 페이지 (`/`) - 마케팅 홈페이지 |
| `globals.css` | 전역 CSS - Tailwind 지시자, CSS 변수, 커스텀 스타일 |

#### (auth)/ - 인증 페이지 그룹

```
(auth)/
├── layout.tsx      # 인증 페이지 공통 레이아웃 (로그인 상태 체크)
├── login/
│   └── page.tsx    # 로그인 페이지 - OAuth(Google/카카오/네이버) + 이메일 로그인
└── register/
    └── page.tsx    # 회원가입 페이지 - OAuth + 이메일 회원가입
```

#### (dashboard)/ - 대시보드 페이지 그룹

```
(dashboard)/
├── layout.tsx              # 대시보드 레이아웃 - 사이드바, 헤더, 인증 필수
└── dashboard/
    ├── page.tsx            # 메인 대시보드 - 통계, 최근 활동
    ├── prompts/
    │   ├── page.tsx        # 프롬프트 목록
    │   ├── new/page.tsx    # 새 프롬프트 생성
    │   └── [id]/page.tsx   # 프롬프트 상세/편집 (동적 라우트)
    ├── billing/
    │   └── page.tsx        # 구독 관리 - Stripe/토스 결제
    ├── team/
    │   └── page.tsx        # 팀 관리 - 멤버 초대, 역할 설정
    ├── settings/
    │   └── page.tsx        # 사용자 설정 - 프로필, 알림
    └── api-keys/
        └── page.tsx        # API 키 관리
```

#### api/ - API 라우트

```
api/
├── auth/
│   └── naver/
│       ├── route.ts           # 네이버 OAuth 시작
│       └── callback/route.ts  # 네이버 OAuth 콜백
├── billing/
│   ├── checkout/route.ts      # 결제 세션 생성 (Stripe/토스)
│   ├── portal/route.ts        # Stripe Customer Portal
│   ├── subscription/route.ts  # 구독 정보 조회
│   └── toss/
│       ├── success/route.ts   # 토스 결제 성공 처리
│       └── fail/route.ts      # 토스 결제 실패 처리
├── webhooks/
│   ├── stripe/route.ts        # Stripe 웹훅 처리
│   └── toss/route.ts          # 토스페이먼츠 웹훅 처리
├── prompts/
│   ├── route.ts               # 프롬프트 CRUD (GET, POST)
│   ├── [id]/route.ts          # 개별 프롬프트 (GET, PUT, DELETE)
│   └── generate/route.ts      # AI 프롬프트 생성
├── api-keys/
│   ├── route.ts               # API 키 생성/목록
│   └── [id]/route.ts          # API 키 삭제
└── user/
    └── profile/route.ts       # 사용자 프로필 업데이트
```

#### auth/ - 인증 콜백

| 파일 | 설명 |
|------|------|
| `callback/route.ts` | OAuth 콜백 처리 - 코드 교환, 세션 생성 |

---

### src/components/

#### layout/ - 레이아웃 컴포넌트

| 파일 | 설명 |
|------|------|
| `header.tsx` | 대시보드 상단 헤더 - 검색, 알림, 사용자 메뉴 |
| `sidebar.tsx` | 대시보드 사이드바 - 네비게이션 메뉴, 플랜 표시 |

#### ui/ - UI 컴포넌트

shadcn/ui 기반 재사용 컴포넌트:

| 컴포넌트 | 설명 |
|----------|------|
| `button.tsx` | 버튼 - variant, size, loading 상태 지원 |
| `input.tsx` | 입력 필드 - leftIcon, error 상태 지원 |
| `card.tsx` | 카드 컴포넌트 - Header, Content, Footer |
| `dialog.tsx` | 모달 다이얼로그 |
| `dropdown-menu.tsx` | 드롭다운 메뉴 |
| `select.tsx` | 선택 컴포넌트 |
| `tabs.tsx` | 탭 네비게이션 |
| `badge.tsx` | 뱃지/태그 |
| `avatar.tsx` | 사용자 아바타 |
| `checkbox.tsx` | 체크박스 |
| `switch.tsx` | 토글 스위치 |
| `textarea.tsx` | 텍스트 영역 |
| `label.tsx` | 폼 라벨 |
| `separator.tsx` | 구분선 |
| `progress.tsx` | 진행률 표시 |
| `sonner.tsx` | 토스트 알림 (Sonner) |
| `index.ts` | 모든 컴포넌트 re-export |

#### providers.tsx

전역 Provider 래퍼:
- React Query (TanStack Query)
- Sonner Toast Provider
- 테마 Provider (필요시)

---

### src/lib/

#### supabase/ - Supabase 클라이언트

| 파일 | 설명 |
|------|------|
| `client.ts` | 클라이언트 사이드 Supabase 클라이언트 (브라우저용) |
| `server.ts` | 서버 사이드 Supabase 클라이언트 (API 라우트, Server Component용) |
| `middleware.ts` | 미들웨어용 Supabase 클라이언트 |

#### payments/ - 결제 시스템

| 파일 | 설명 |
|------|------|
| `types.ts` | 결제 타입 정의, 플랜 설정 (가격, 기능) |
| `region.ts` | 리전 감지 - IP, 언어, 타임존 기반 |
| `toss.ts` | 토스페이먼츠 API 통합 |
| `index.ts` | 통합 결제 인터페이스 - Stripe/토스 자동 선택 |

#### 핵심 유틸리티

| 파일 | 설명 |
|------|------|
| `auth.ts` | 인증 유틸리티 - getUser, requireAuth, 세션 관리 |
| `rbac.ts` | 역할 기반 접근 제어 - 권한 체크, 역할 계층 |
| `stripe.ts` | Stripe 클라이언트 초기화 |
| `utils.ts` | 공통 유틸리티 - cn (클래스 병합), formatDate 등 |

---

### src/types/

| 파일 | 설명 |
|------|------|
| `database.ts` | Supabase 데이터베이스 타입 (자동 생성 가능) |

---

### src/middleware.ts

Next.js 미들웨어:
- 인증 상태 확인
- 보호된 라우트 접근 제어
- 세션 갱신

---

### supabase/

#### migrations/ - 데이터베이스 마이그레이션

| 파일 | 설명 |
|------|------|
| `00001_initial_schema.sql` | 기본 스키마 - profiles, teams, subscriptions, prompts 등 |
| `00002_payment_providers.sql` | 결제 프로바이더 - payment_history, billing_keys |

#### seed.sql

초기 데이터:
- 시스템 프롬프트 템플릿
- 기본 카테고리

---

## 라우트 그룹 설명

### (auth) 그룹

```
URL: /login, /register
레이아웃: 인증 페이지 전용 (로고 중앙, 카드 형태)
특징: 로그인한 사용자는 /dashboard로 리다이렉트
```

### (dashboard) 그룹

```
URL: /dashboard/*
레이아웃: 사이드바 + 헤더 + 콘텐츠 영역
특징: 인증 필수, 미인증 시 /login으로 리다이렉트
```

---

## 동적 라우트

| 경로 | 설명 |
|------|------|
| `/dashboard/prompts/[id]` | 프롬프트 ID로 상세 페이지 접근 |
| `/api/prompts/[id]` | 프롬프트 ID로 API 접근 |
| `/api/api-keys/[id]` | API 키 ID로 삭제 |

---

## 파일 명명 규칙

| 유형 | 규칙 | 예시 |
|------|------|------|
| 페이지 | `page.tsx` | `dashboard/page.tsx` |
| 레이아웃 | `layout.tsx` | `(auth)/layout.tsx` |
| API 라우트 | `route.ts` | `api/prompts/route.ts` |
| 컴포넌트 | kebab-case | `dropdown-menu.tsx` |
| 유틸리티 | camelCase | `auth.ts`, `stripe.ts` |
| 타입 | camelCase | `database.ts` |

---

## 폴더별 책임

| 폴더 | 책임 |
|------|------|
| `app/` | 라우팅, 페이지 컴포넌트, API 엔드포인트 |
| `components/` | 재사용 가능한 UI 컴포넌트 |
| `lib/` | 비즈니스 로직, 외부 서비스 통합, 유틸리티 |
| `types/` | TypeScript 타입 정의 |
| `supabase/` | 데이터베이스 스키마, 마이그레이션 |
