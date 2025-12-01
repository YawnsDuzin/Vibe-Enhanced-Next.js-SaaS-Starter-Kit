# 배포 가이드

이 문서는 Vibe-Enhanced Next.js SaaS 스타터 킷을 프로덕션 환경에 배포하는 방법을 설명합니다.

## 목차

1. [사전 요구사항](#사전-요구사항)
2. [Supabase 설정](#supabase-설정)
3. [OAuth 소셜 로그인 설정](#oauth-소셜-로그인-설정)
4. [결제 시스템 설정](#결제-시스템-설정)
5. [Vercel 배포](#vercel-배포)
6. [환경 변수 참조](#환경-변수-참조)
7. [배포 후 체크리스트](#배포-후-체크리스트)

---

## 사전 요구사항

- Node.js 18.x 이상
- npm 또는 yarn
- Git
- Supabase 계정
- Vercel 계정 (또는 다른 호스팅 서비스)
- Stripe 계정 (해외 결제용)
- 토스페이먼츠 계정 (한국 결제용, 선택)

---

## Supabase 설정

### 1. 프로젝트 생성

1. [Supabase Dashboard](https://supabase.com/dashboard)에서 새 프로젝트 생성
2. 프로젝트 이름, 데이터베이스 비밀번호 설정
3. 리전 선택 (한국 사용자가 주 타겟이면 `Northeast Asia (Tokyo)` 추천)

### 2. 데이터베이스 스키마 적용

SQL Editor에서 다음 순서로 마이그레이션 파일 실행:

```sql
-- 1. 기본 스키마
-- supabase/migrations/00001_initial_schema.sql 내용 실행

-- 2. 결제 프로바이더 스키마
-- supabase/migrations/00002_payment_providers.sql 내용 실행
```

### 3. API 키 확인

Project Settings → API에서 다음 값 확인:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (비밀로 유지!)

### 4. Authentication 설정

Authentication → URL Configuration에서:
- **Site URL**: `https://your-domain.com`
- **Redirect URLs**: `https://your-domain.com/**`

---

## OAuth 소셜 로그인 설정

### Google 로그인

#### 1. Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. APIs & Services → Credentials → Create Credentials → OAuth client ID
4. Application type: `Web application`
5. Authorized redirect URIs 추가:
   ```
   https://[YOUR_SUPABASE_PROJECT_REF].supabase.co/auth/v1/callback
   ```

#### 2. Supabase 설정

1. Supabase Dashboard → Authentication → Providers → Google
2. Enable Google 활성화
3. Client ID, Client Secret 입력

---

### 카카오 로그인

#### 1. Kakao Developers 설정

1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 내 애플리케이션 → 애플리케이션 추가
3. 앱 설정 → 플랫폼 → Web 플랫폼 등록
   - 사이트 도메인: `https://your-domain.com`
4. 카카오 로그인 → 활성화 설정 ON
5. 카카오 로그인 → Redirect URI 등록:
   ```
   https://[YOUR_SUPABASE_PROJECT_REF].supabase.co/auth/v1/callback
   ```
6. 동의항목 → 필수 동의항목 설정:
   - 닉네임 (필수)
   - 카카오계정(이메일) (필수)
   - 프로필 사진 (선택)

#### 2. Supabase 설정

1. Supabase Dashboard → Authentication → Providers → Kakao
2. Enable Kakao 활성화
3. REST API 키 → Client ID에 입력
4. Client Secret 입력

---

### 네이버 로그인

> ⚠️ Supabase에서 네이버를 기본 지원하지 않아 커스텀 구현되어 있습니다.

#### 1. Naver Developers 설정

1. [네이버 개발자센터](https://developers.naver.com/) 접속
2. Application → 애플리케이션 등록
3. 애플리케이션 이름 입력
4. 사용 API: 네이버 로그인 선택
   - 필수: 회원이름, 이메일주소
   - 선택: 프로필 사진, 별명
5. 환경 추가: PC웹
6. 서비스 URL: `https://your-domain.com`
7. 네이버 로그인 Callback URL:
   ```
   https://your-domain.com/api/auth/naver/callback
   ```

#### 2. 환경 변수 설정

```env
NAVER_CLIENT_ID="발급받은 Client ID"
NAVER_CLIENT_SECRET="발급받은 Client Secret"
```

---

## 결제 시스템 설정

이 스타터 킷은 리전 기반 결제 시스템을 지원합니다:
- **한국 사용자**: 토스페이먼츠 (KRW)
- **해외 사용자**: Stripe (USD)

### Stripe 설정 (해외 결제)

#### 1. Stripe 계정 설정

1. [Stripe Dashboard](https://dashboard.stripe.com/) 접속
2. Developers → API keys에서 키 확인:
   - `Publishable key` → `STRIPE_PUBLISHABLE_KEY`
   - `Secret key` → `STRIPE_SECRET_KEY`

#### 2. 상품 및 가격 생성

Products → Add product에서 각 플랜 생성:

| 플랜 | 가격 | 환경 변수 |
|------|------|----------|
| Starter | $19/월 | `STRIPE_PRICE_ID_STARTER` |
| Pro | $49/월 | `STRIPE_PRICE_ID_PRO` |
| Enterprise | $199/월 | `STRIPE_PRICE_ID_ENTERPRISE` |

#### 3. Webhook 설정

Developers → Webhooks → Add endpoint:
- Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
- Events:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.paid`
  - `invoice.payment_failed`

Signing secret → `STRIPE_WEBHOOK_SECRET`

---

### 토스페이먼츠 설정 (한국 결제)

#### 1. 토스페이먼츠 계정 설정

1. [토스페이먼츠 개발자센터](https://developers.tosspayments.com/) 접속
2. 회원가입 및 사업자 인증
3. API 키 발급:
   - 테스트 키: `test_ck_...`, `test_sk_...`
   - 라이브 키: `live_ck_...`, `live_sk_...`

#### 2. 환경 변수 설정

```env
TOSS_CLIENT_KEY="test_ck_..." # 클라이언트 키
TOSS_SECRET_KEY="test_sk_..." # 시크릿 키
TOSS_WEBHOOK_SECRET=""        # 웹훅 시크릿 (선택)
```

#### 3. Webhook 설정 (선택)

개발자센터 → 웹훅 설정:
- Endpoint URL: `https://your-domain.com/api/webhooks/toss`
- 이벤트: 결제 상태 변경, 정기결제 상태 변경

---

## Vercel 배포

### 1. GitHub 연동

```bash
# 저장소를 GitHub에 푸시
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

### 2. Vercel 프로젝트 생성

1. [Vercel Dashboard](https://vercel.com/dashboard) → New Project
2. GitHub 저장소 연결
3. Framework Preset: Next.js 자동 감지

### 3. 환경 변수 설정

Project Settings → Environment Variables에서 모든 환경 변수 추가:

| 변수명 | 필수 | 설명 |
|--------|:----:|------|
| `NEXT_PUBLIC_APP_URL` | ✅ | 배포된 앱 URL |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key |
| `STRIPE_SECRET_KEY` | ✅ | Stripe Secret Key |
| `STRIPE_PUBLISHABLE_KEY` | ✅ | Stripe Publishable Key |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Stripe Webhook Secret |
| `STRIPE_PRICE_ID_STARTER` | ✅ | Starter 플랜 Price ID |
| `STRIPE_PRICE_ID_PRO` | ✅ | Pro 플랜 Price ID |
| `STRIPE_PRICE_ID_ENTERPRISE` | ✅ | Enterprise 플랜 Price ID |
| `TOSS_CLIENT_KEY` | ⚠️ | 토스페이먼츠 Client Key |
| `TOSS_SECRET_KEY` | ⚠️ | 토스페이먼츠 Secret Key |
| `TOSS_WEBHOOK_SECRET` | ⚠️ | 토스페이먼츠 Webhook Secret |
| `NAVER_CLIENT_ID` | ⚠️ | 네이버 로그인 Client ID |
| `NAVER_CLIENT_SECRET` | ⚠️ | 네이버 로그인 Client Secret |
| `OPENAI_API_KEY` | ❌ | OpenAI API 키 (AI 기능용) |
| `RESEND_API_KEY` | ❌ | Resend API 키 (이메일용) |

> ✅ 필수 | ⚠️ 한국 서비스 시 필수 | ❌ 선택

### 4. 배포 실행

```bash
# Vercel CLI로 배포
npm i -g vercel
vercel --prod
```

또는 Vercel 대시보드에서 Deploy 버튼 클릭

---

## 환경 변수 참조

### 전체 .env.example

```env
# ===========================================
# Application
# ===========================================
NEXT_PUBLIC_APP_NAME="Vibe SaaS"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NODE_ENV="production"

# ===========================================
# Supabase
# ===========================================
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# ===========================================
# OAuth 인증 (소셜 로그인)
# ===========================================
# Google, Kakao: Supabase 대시보드에서 설정
# 네이버: 아래 환경 변수 필요
NAVER_CLIENT_ID=""
NAVER_CLIENT_SECRET=""

# ===========================================
# Stripe 결제 (해외)
# ===========================================
STRIPE_SECRET_KEY=""
STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""
STRIPE_PRICE_ID_STARTER=""
STRIPE_PRICE_ID_PRO=""
STRIPE_PRICE_ID_ENTERPRISE=""

# ===========================================
# 토스페이먼츠 (한국)
# ===========================================
TOSS_CLIENT_KEY=""
TOSS_SECRET_KEY=""
TOSS_WEBHOOK_SECRET=""

# ===========================================
# 이메일 (Resend)
# ===========================================
RESEND_API_KEY=""
EMAIL_FROM="noreply@yourdomain.com"

# ===========================================
# AI / OpenAI
# ===========================================
OPENAI_API_KEY=""

# ===========================================
# 분석 (선택)
# ===========================================
NEXT_PUBLIC_POSTHOG_KEY=""
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
```

---

## 배포 후 체크리스트

### 필수 확인 사항

- [ ] **Supabase 설정**
  - [ ] Site URL이 배포된 도메인으로 설정됨
  - [ ] Redirect URLs에 배포 도메인 추가됨
  - [ ] 데이터베이스 스키마 적용 완료

- [ ] **OAuth 소셜 로그인**
  - [ ] Google 로그인 테스트 완료
  - [ ] 카카오 로그인 테스트 완료
  - [ ] 네이버 로그인 테스트 완료 (한국 서비스 시)

- [ ] **결제 시스템**
  - [ ] Stripe 테스트 결제 완료
  - [ ] Stripe Webhook 연결 확인
  - [ ] 토스페이먼츠 테스트 결제 완료 (한국 서비스 시)
  - [ ] 토스페이먼츠 Webhook 연결 확인

- [ ] **기타**
  - [ ] 이메일 발송 테스트 (Resend)
  - [ ] 관리자 계정 생성 및 권한 설정
  - [ ] 에러 모니터링 설정 (Sentry 등)

### 프로덕션 전환 전

1. **Stripe**: 테스트 모드 → 라이브 모드 전환
2. **토스페이먼츠**: 테스트 키 → 라이브 키 전환
3. **네이버**: 검수 신청 및 승인 대기
4. **카카오**: 앱 검수 요청 (필요시)

---

## 문제 해결

### OAuth 로그인 실패

1. Redirect URL이 정확히 설정되었는지 확인
2. Supabase Dashboard에서 해당 Provider가 활성화되었는지 확인
3. Client ID/Secret이 올바른지 확인

### 결제 실패

1. API 키가 올바른지 확인 (테스트/라이브 구분)
2. Webhook URL이 HTTPS인지 확인
3. 브라우저 콘솔에서 에러 메시지 확인

### 네이버 로그인 오류

1. Callback URL이 `/api/auth/naver/callback`으로 정확히 설정되었는지 확인
2. NAVER_CLIENT_ID, NAVER_CLIENT_SECRET 환경 변수 확인
3. 네이버 개발자센터에서 애플리케이션 상태 확인

---

## 지원

문제가 발생하면 다음을 확인하세요:
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [토스페이먼츠 개발자문서](https://docs.tosspayments.com/)
