# Vibe-Enhanced Next.js SaaS 스타터 킷

프로덕션 준비가 완료된, 기능이 풍부한 SaaS 보일러플레이트입니다. Next.js 14, TypeScript, 그리고 최신 모범 사례를 기반으로 구축되었습니다. 몇 달이 아닌 며칠 만에 SaaS 제품을 출시하세요.

## 왜 이 스타터 킷인가?

- 신규 SaaS 시작 시 이미 **40% 개발 완료**된 상태로 시작
- **1인 개발자**에게 필수적인 모든 기능 포함
- 검증된 기술 스택과 모범 사례 적용

## 주요 기능

### 인증 (Authentication)
- NextAuth.js v5 기반 이메일/비밀번호 인증
- OAuth 제공자 지원 (Google, GitHub)
- JWT 기반 세션 관리
- 보호된 라우트 및 미들웨어

### 결제 및 구독 (Billing & Subscriptions)
- Stripe 완전 통합
- 다양한 요금제 (무료, 스타터, 프로, 엔터프라이즈)
- 구독 관리를 위한 고객 포털
- 구독 이벤트 웹훅 처리
- 인보이스 추적

### 역할 기반 접근 제어 (RBAC)
- 사용자 역할 (일반 사용자, 관리자, 슈퍼 관리자)
- 팀 역할 (뷰어, 멤버, 관리자, 소유자)
- 권한 기반 접근 제어
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
- Prisma ORM + PostgreSQL
- ESLint 설정
- 모듈형 아키텍처
- API 라우트 핸들러

## 기술 스택

| 분류 | 기술 |
|------|------|
| **프레임워크** | Next.js 14 (App Router) |
| **언어** | TypeScript |
| **스타일링** | Tailwind CSS |
| **UI 컴포넌트** | shadcn/ui + Radix UI |
| **데이터베이스** | PostgreSQL + Prisma ORM |
| **인증** | NextAuth.js v5 |
| **결제** | Stripe |
| **상태 관리** | Zustand + React Query |
| **폼** | React Hook Form + Zod |
| **이메일** | Resend |
| **AI** | OpenAI SDK |

## 시작하기

### 사전 요구사항

- Node.js 18.17 이상
- PostgreSQL 데이터베이스
- Stripe 계정
- (선택) OpenAI API 키

### 설치

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
# 데이터베이스
DATABASE_URL="postgresql://..."

# 인증
AUTH_SECRET="your-secret"
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."

# Stripe
STRIPE_SECRET_KEY="..."
STRIPE_WEBHOOK_SECRET="..."

# OpenAI (선택)
OPENAI_API_KEY="..."
```

5. 데이터베이스 설정:
```bash
npm run db:push
npm run db:seed
```

6. 개발 서버 시작:
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
│   ├── auth.ts            # NextAuth 설정
│   ├── db.ts              # Prisma 클라이언트
│   ├── rbac.ts            # 역할 기반 접근 제어
│   ├── stripe.ts          # Stripe 유틸리티
│   └── utils.ts           # 유틸리티 함수
└── middleware.ts          # 라우트 보호
```

## 주요 기능 상세 설명

### 인증 플로우

인증 시스템은 다음을 지원합니다:
- 이메일/비밀번호 회원가입 및 로그인
- Google 및 GitHub OAuth
- JWT 토큰 기반 세션 관리
- 회원가입 시 무료 구독 자동 생성

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

권한은 `src/lib/rbac.ts`에 정의되어 있습니다:
- 전역 역할: USER, ADMIN, SUPER_ADMIN
- 팀 역할: VIEWER, MEMBER, ADMIN, OWNER
- 권한 확인 함수
- 미들웨어 통합

## 사용 가능한 스크립트

```bash
npm run dev          # 개발 서버 시작
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버 시작
npm run lint         # ESLint 실행
npm run type-check   # TypeScript 타입 검사
npm run db:generate  # Prisma 클라이언트 생성
npm run db:push      # 스키마를 데이터베이스에 푸시
npm run db:migrate   # 마이그레이션 실행
npm run db:seed      # 데이터베이스 시딩
npm run db:studio    # Prisma Studio 열기
```

## 배포

### Vercel (권장)

1. GitHub에 코드 푸시
2. Vercel에서 프로젝트 임포트
3. 환경 변수 추가
4. 배포!

### Docker

```bash
docker build -t vibe-saas .
docker run -p 3000:3000 vibe-saas
```

## 데모 계정

데이터베이스 시딩 후:

| 역할 | 이메일 | 비밀번호 |
|------|--------|----------|
| 관리자 | admin@example.com | admin123 |
| 데모 사용자 | demo@example.com | demo123 |

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

| 플랜 | 가격 | 일일 프롬프트 | 팀원 수 |
|------|------|--------------|--------|
| 무료 | $0 | 5개 | 1명 |
| 스타터 | $19/월 | 100개 | 5명 |
| 프로 | $49/월 | 무제한 | 20명 |
| 엔터프라이즈 | $199/월 | 무제한 | 무제한 |

## 기여하기

기여를 환영합니다! PR을 제출하기 전에 기여 가이드라인을 읽어주세요.

## 라이선스

MIT 라이선스 - 자유롭게 프로젝트에 사용하세요.

## 지원

- [문서](https://docs.example.com)
- [GitHub Issues](https://github.com/your-repo/issues)
- [Discord 커뮤니티](https://discord.gg/example)

---

Next.js, TypeScript, 그리고 최신 웹 기술로 만들었습니다.
