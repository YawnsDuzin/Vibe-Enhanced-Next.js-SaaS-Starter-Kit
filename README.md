# Vibe-Enhanced Next.js SaaS 스타터 킷 (Supabase)

프로덕션 준비가 완료된, 기능이 풍부한 SaaS 보일러플레이트입니다. Next.js 14, TypeScript, Supabase, 그리고 최신 모범 사례를 기반으로 구축되었습니다. 몇 달이 아닌 며칠 만에 SaaS 제품을 출시하세요.

## 왜 이 스타터 킷인가?

- 신규 SaaS 시작 시 이미 **40% 개발 완료**된 상태로 시작
- **1인 개발자**에게 필수적인 모든 기능 포함
- Supabase로 **간편한 백엔드 구성**
- 검증된 기술 스택과 모범 사례 적용

## 주요 기능

### 인증 (Authentication)
- Supabase Auth 기반 인증
- **한국 맞춤형 OAuth 제공자**
  - Google 로그인
  - 카카오 로그인
  - 네이버 로그인
- 이메일/비밀번호 인증
- 보호된 라우트 및 미들웨어
- 자동 세션 갱신

### 결제 및 구독 (Billing & Subscriptions)
- **리전 기반 결제 시스템**
  - 한국: 토스페이먼츠 (신용카드, 체크카드, 계좌이체)
  - 해외: Stripe (모든 주요 결제 수단)
- 자동 리전 감지 (IP, 브라우저 언어, 타임존)
- 다양한 요금제 (무료, 스타터, 프로, 엔터프라이즈)
- 다중 통화 지원 (KRW, USD)
- 구독 관리를 위한 고객 포털
- 구독 이벤트 웹훅 처리
- 인보이스 추적

### 역할 기반 접근 제어 (RBAC)
- 사용자 역할 (일반 사용자, 관리자, 슈퍼 관리자)
- 팀 역할 (뷰어, 멤버, 관리자, 소유자)
- Row Level Security (RLS) 정책
- 라우트 보호 미들웨어

### 팀 관리 (Team Management)
- 멀티테넌트 아키텍처
- 팀 생성 및 관리
- 팀 초대 기능
- 역할 기반 팀 권한

### AI 프롬프트 관리
- 사전 구축된 프롬프트 템플릿
- 커스텀 프롬프트 생성
- 변수 치환 기능 (예: `{{topic}}`, `{{tone}}`)
- OpenAI 통합
- 사용량 추적 및 분석

### UI 컴포넌트
- shadcn/ui 컴포넌트 시스템
- 다크/라이트 모드 지원
- 반응형 디자인
- 접근성 컴포넌트
- 커스텀 애니메이션

### 개발자 경험
- 전체 TypeScript 적용
- Supabase + PostgreSQL
- Row Level Security (RLS)
- ESLint 설정
- 모듈형 아키텍처

## 기술 스택

| 분류 | 기술 |
|------|------|
| **프레임워크** | Next.js 14 (App Router) |
| **언어** | TypeScript |
| **스타일링** | Tailwind CSS |
| **UI 컴포넌트** | shadcn/ui + Radix UI |
| **데이터베이스** | Supabase (PostgreSQL) |
| **인증** | Supabase Auth |
| **결제** | Stripe + 토스페이먼츠 |
| **상태 관리** | Zustand + React Query |
| **폼** | React Hook Form + Zod |
| **이메일** | Resend |
| **AI** | OpenAI SDK |

## 시작하기

### 사전 요구사항

- Node.js 18.17 이상
- Supabase 계정 (무료로 시작 가능)
- Stripe 계정
- (선택) OpenAI API 키

### Supabase 프로젝트 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성

2. SQL Editor에서 스키마 실행:
```bash
# supabase/migrations/00001_initial_schema.sql 파일의 내용을
# Supabase SQL Editor에 복사하여 실행
```

3. Supabase 대시보드에서 API 키 확인:
   - Project Settings → API
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

4. OAuth 제공자 설정 (선택):
   - Authentication → Providers
   - Google, GitHub 등 활성화

### 로컬 설치

1. 저장소 클론:
```bash
git clone https://github.com/your-repo/vibe-saas-starter.git
cd vibe-saas-starter
```

2. 의존성 설치:
```bash
npm install
# 또는
pnpm install
```

3. 환경 변수 파일 복사:
```bash
cp .env.example .env.local
```

4. `.env.local`에서 환경 변수 설정:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Stripe
STRIPE_SECRET_KEY="..."
STRIPE_WEBHOOK_SECRET="..."

# OpenAI (선택)
OPENAI_API_KEY="..."
```

5. 개발 서버 시작:
```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 앱을 확인하세요.

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 페이지
│   ├── (dashboard)/       # 대시보드 페이지
│   ├── api/               # API 라우트
│   └── page.tsx           # 랜딩 페이지
├── components/
│   ├── layout/            # 레이아웃 컴포넌트
│   ├── ui/                # UI 컴포넌트
│   └── providers.tsx      # 컨텍스트 프로바이더
├── lib/
│   ├── auth.ts            # Supabase Auth 유틸리티
│   ├── supabase/          # Supabase 클라이언트
│   │   ├── client.ts      # 브라우저 클라이언트
│   │   ├── server.ts      # 서버 클라이언트
│   │   └── middleware.ts  # 미들웨어 클라이언트
│   ├── rbac.ts            # 역할 기반 접근 제어
│   ├── stripe.ts          # Stripe 유틸리티
│   └── utils.ts           # 유틸리티 함수
├── types/
│   └── database.ts        # Supabase 타입 정의
├── middleware.ts          # 라우트 보호
└── supabase/
    └── migrations/        # SQL 마이그레이션
```

## Supabase 기능 활용

### Row Level Security (RLS)

모든 테이블에 RLS가 적용되어 있습니다:
- 사용자는 자신의 데이터만 접근 가능
- 관리자는 모든 데이터 접근 가능
- 팀 멤버는 팀 데이터 접근 가능

### 자동 트리거

- 사용자 가입 시 자동으로 프로필 생성
- 사용자 가입 시 무료 구독 자동 생성
- `updated_at` 자동 갱신

### 타입 안전성

```bash
# Supabase 타입 생성
npm run db:types
```

## 주요 기능 상세 설명

### 인증 플로우

Supabase Auth를 사용한 인증:
- 이메일/비밀번호 회원가입 및 로그인
- Google 및 GitHub OAuth
- 자동 세션 갱신 (미들웨어)
- 회원가입 시 프로필 및 무료 구독 자동 생성

### 구독 관리

사용자는 다음을 할 수 있습니다:
- 결제 페이지에서 이용 가능한 요금제 확인
- Stripe Checkout을 통한 구독
- Stripe 고객 포털을 통한 구독 관리
- 웹훅 처리로 구독 상태 자동 업데이트

### AI 프롬프트

프롬프트 시스템은 다음을 포함합니다:
- 시스템 제공 프롬프트 템플릿
- 사용자 커스텀 프롬프트 생성
- 변수 치환 (예: `{{topic}}`, `{{tone}}`)
- 사용량 추적 및 분석
- OpenAI 통합 생성

### RBAC 시스템

권한은 Supabase RLS와 함께 관리됩니다:
- 전역 역할: USER, ADMIN, SUPER_ADMIN
- 팀 역할: VIEWER, MEMBER, ADMIN, OWNER
- 데이터베이스 수준의 보안

## 사용 가능한 스크립트

```bash
npm run dev          # 개발 서버 시작
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버 시작
npm run lint         # ESLint 실행
npm run type-check   # TypeScript 타입 검사
npm run db:types     # Supabase 타입 생성
npm run db:seed      # 데이터베이스 시딩
```

## 배포

> 📖 **상세 배포 가이드**: [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)

### 빠른 배포 (Vercel)

#### 1단계: Supabase 설정

```bash
# 1. Supabase 프로젝트 생성 후
# 2. SQL Editor에서 스키마 실행
# supabase/migrations/00001_initial_schema.sql

# 3. API 키 확인 (Project Settings → API)
```

#### 2단계: Stripe 설정

```bash
# 1. Stripe 대시보드에서 상품/가격 생성
# 2. Webhook 설정 (Endpoint: https://your-domain.vercel.app/api/webhooks/stripe)
# 3. Customer Portal 활성화
```

#### 3단계: Vercel 배포

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/vibe-saas-starter)

또는 수동으로:

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

#### 4단계: 환경 변수 설정

Vercel 대시보드 → Project Settings → Environment Variables:

| 변수명 | 필수 | 설명 |
|--------|------|------|
| `NEXT_PUBLIC_APP_URL` | ✅ | 배포된 앱 URL |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key |
| `STRIPE_SECRET_KEY` | ✅ | Stripe Secret Key (해외 결제) |
| `STRIPE_PUBLISHABLE_KEY` | ✅ | Stripe Publishable Key |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Stripe Webhook Secret |
| `STRIPE_PRICE_ID_STARTER` | ✅ | Starter 플랜 Price ID |
| `STRIPE_PRICE_ID_PRO` | ✅ | Pro 플랜 Price ID |
| `STRIPE_PRICE_ID_ENTERPRISE` | ✅ | Enterprise 플랜 Price ID |
| `TOSS_CLIENT_KEY` | ⚠️ | 토스페이먼츠 Client Key (한국 결제) |
| `TOSS_SECRET_KEY` | ⚠️ | 토스페이먼츠 Secret Key |
| `TOSS_WEBHOOK_SECRET` | ⚠️ | 토스페이먼츠 Webhook Secret |
| `NAVER_CLIENT_ID` | ⚠️ | 네이버 로그인 Client ID |
| `NAVER_CLIENT_SECRET` | ⚠️ | 네이버 로그인 Client Secret |
| `OPENAI_API_KEY` | ❌ | OpenAI API 키 (AI 기능용) |

> ⚠️ 한국 사용자를 위해 토스페이먼츠, 네이버 로그인 키가 필요합니다.

#### 5단계: 배포 후 설정

```bash
# 1. Supabase Site URL 업데이트
#    Authentication → URL Configuration → Site URL

# 2. Supabase Redirect URLs 추가
#    https://your-domain.vercel.app/**

# 3. OAuth Provider Callback URL 업데이트 (사용시)
```

### 배포 체크리스트

- [ ] Supabase 프로젝트 생성 및 스키마 적용
  - [ ] `00001_initial_schema.sql` 실행
  - [ ] `00002_payment_providers.sql` 실행
- [ ] OAuth 소셜 로그인 설정
  - [ ] Google: Supabase → Authentication → Providers → Google 활성화
  - [ ] 카카오: Supabase → Authentication → Providers → Kakao 활성화
  - [ ] 네이버: 네이버 개발자센터에서 앱 등록 후 환경변수 설정
- [ ] Stripe 상품/가격 생성 (해외 결제)
- [ ] Stripe Webhook 설정 (`/api/webhooks/stripe`)
- [ ] 토스페이먼츠 설정 (한국 결제)
  - [ ] 토스페이먼츠 개발자센터 가입
  - [ ] API 키 발급 및 환경 변수 설정
  - [ ] Webhook 설정 (`/api/webhooks/toss`)
- [ ] Vercel 환경 변수 설정
- [ ] Supabase URL 설정 업데이트
- [ ] 테스트 결제 진행 (Stripe + 토스페이먼츠)
- [ ] 관리자 계정 설정

## 페이지 구성

| 경로 | 설명 |
|------|------|
| `/` | 마케팅 랜딩 페이지 |
| `/login` | 로그인 페이지 |
| `/register` | 회원가입 페이지 |
| `/dashboard` | 메인 대시보드 |
| `/dashboard/prompts` | AI 프롬프트 관리 |
| `/dashboard/billing` | 구독 및 결제 |
| `/dashboard/team` | 팀 관리 |
| `/dashboard/settings` | 사용자 설정 |
| `/dashboard/api-keys` | API 키 관리 |

## 요금제 구성

| 플랜 | 가격 (USD) | 가격 (KRW) | 일일 프롬프트 | 팀원 수 |
|------|-----------|-----------|--------------|--------|
| 무료 | $0 | ₩0 | 5개 | 1명 |
| 스타터 | $19/월 | ₩19,000/월 | 100개 | 5명 |
| 프로 | $49/월 | ₩49,000/월 | 무제한 | 20명 |
| 엔터프라이즈 | $199/월 | ₩199,000/월 | 무제한 | 무제한 |

> 결제 시스템은 사용자의 접속 지역에 따라 자동으로 결제 수단을 선택합니다.
> - 한국: 토스페이먼츠 (KRW)
> - 해외: Stripe (USD)

## Supabase vs Prisma 비교

이 스타터 킷은 Supabase를 사용합니다:

| 기능 | Supabase | Prisma |
|------|----------|--------|
| 호스팅 | 관리형 | 셀프 호스팅 필요 |
| 인증 | 내장 | 별도 설정 필요 |
| 보안 | RLS | 애플리케이션 수준 |
| 실시간 | 내장 | 추가 구현 필요 |
| 비용 | 무료 티어 관대 | DB 호스팅 별도 |

## 기여하기

기여를 환영합니다! PR을 제출하기 전에 기여 가이드라인을 읽어주세요.

## 라이선스

MIT 라이선스 - 자유롭게 프로젝트에 사용하세요.

## 지원

- [GitHub Issues](https://github.com/your-repo/issues)
- [Supabase 문서](https://supabase.com/docs)
- [Next.js 문서](https://nextjs.org/docs)

---

Next.js, TypeScript, Supabase, 그리고 최신 웹 기술로 만들었습니다.
