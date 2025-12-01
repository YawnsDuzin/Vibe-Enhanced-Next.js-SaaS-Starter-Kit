# Vercel 배포 가이드

이 문서는 Vibe SaaS 스타터 킷을 Vercel에 배포하는 상세한 방법을 안내합니다.

## 목차

1. [사전 준비](#사전-준비)
2. [Supabase 설정](#supabase-설정)
3. [Stripe 설정](#stripe-설정)
4. [Vercel 배포](#vercel-배포)
5. [환경 변수 설정](#환경-변수-설정)
6. [배포 후 설정](#배포-후-설정)
7. [문제 해결](#문제-해결)

---

## 사전 준비

배포 전 다음 계정이 필요합니다:

- [Vercel 계정](https://vercel.com/signup)
- [Supabase 계정](https://supabase.com)
- [Stripe 계정](https://stripe.com)
- [GitHub 계정](https://github.com) (권장)

---

## Supabase 설정

### 1. 프로젝트 생성

1. [Supabase 대시보드](https://supabase.com/dashboard)에 로그인
2. **New Project** 클릭
3. 프로젝트 정보 입력:
   - **Name**: 프로젝트 이름 (예: vibe-saas-prod)
   - **Database Password**: 강력한 비밀번호 설정
   - **Region**: 가장 가까운 리전 선택 (한국: Northeast Asia - Seoul)
4. **Create new project** 클릭

### 2. 데이터베이스 스키마 설정

1. 좌측 메뉴에서 **SQL Editor** 클릭
2. `supabase/migrations/00001_initial_schema.sql` 파일 내용 복사
3. SQL Editor에 붙여넣기 후 **Run** 클릭

### 3. API 키 확인

1. **Project Settings** → **API** 이동
2. 다음 값들을 메모:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

### 4. OAuth 설정 (선택)

#### Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com/)에서 프로젝트 생성
2. **APIs & Services** → **Credentials** 이동
3. **Create Credentials** → **OAuth client ID**
4. **Web application** 선택
5. **Authorized redirect URIs** 추가:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
6. Client ID와 Secret 복사
7. Supabase 대시보드 → **Authentication** → **Providers** → **Google**
8. Client ID와 Secret 입력 후 저장

#### GitHub OAuth

1. [GitHub Developer Settings](https://github.com/settings/developers)에서 OAuth App 생성
2. **Authorization callback URL** 설정:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
3. Client ID와 Secret 복사
4. Supabase 대시보드 → **Authentication** → **Providers** → **GitHub**
5. Client ID와 Secret 입력 후 저장

### 5. Site URL 설정

1. Supabase 대시보드 → **Authentication** → **URL Configuration**
2. **Site URL** 설정: `https://your-vercel-domain.vercel.app`
3. **Redirect URLs** 추가:
   ```
   https://your-vercel-domain.vercel.app/**
   https://your-vercel-domain.vercel.app/auth/callback
   ```

---

## Stripe 설정

### 1. API 키 확인

1. [Stripe 대시보드](https://dashboard.stripe.com)에 로그인
2. **Developers** → **API keys** 이동
3. 다음 키들을 메모:
   - `Publishable key` → `STRIPE_PUBLISHABLE_KEY`
   - `Secret key` → `STRIPE_SECRET_KEY`

### 2. 상품 및 가격 생성

1. **Products** → **Add product** 클릭
2. 각 플랜별 상품 생성:

#### Starter 플랜
- **Name**: Starter
- **Pricing**: $19/month (recurring)
- 생성 후 Price ID 복사 → `STRIPE_PRICE_ID_STARTER`

#### Pro 플랜
- **Name**: Pro
- **Pricing**: $49/month (recurring)
- 생성 후 Price ID 복사 → `STRIPE_PRICE_ID_PRO`

#### Enterprise 플랜
- **Name**: Enterprise
- **Pricing**: $199/month (recurring)
- 생성 후 Price ID 복사 → `STRIPE_PRICE_ID_ENTERPRISE`

### 3. Webhook 설정

1. **Developers** → **Webhooks** 이동
2. **Add endpoint** 클릭
3. Endpoint URL 설정:
   ```
   https://your-vercel-domain.vercel.app/api/webhooks/stripe
   ```
4. 이벤트 선택:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. **Add endpoint** 클릭
6. **Signing secret** 복사 → `STRIPE_WEBHOOK_SECRET`

### 4. Customer Portal 설정

1. **Settings** → **Customer portal** 이동
2. 다음 기능 활성화:
   - Update subscriptions
   - Cancel subscriptions
   - Update payment methods
   - View invoices
3. **Save changes** 클릭

---

## Vercel 배포

### 방법 1: GitHub 연동 (권장)

1. 코드를 GitHub에 푸시:
   ```bash
   git push origin main
   ```

2. [Vercel 대시보드](https://vercel.com/dashboard)에 로그인

3. **Add New** → **Project** 클릭

4. **Import Git Repository**에서 GitHub 저장소 선택

5. **Configure Project**:
   - **Framework Preset**: Next.js (자동 감지)
   - **Root Directory**: ./ (기본값)
   - **Build Command**: `npm run build` (기본값)
   - **Output Directory**: .next (기본값)

6. **Environment Variables** 추가 (아래 [환경 변수 설정](#환경-변수-설정) 참조)

7. **Deploy** 클릭

### 방법 2: Vercel CLI

1. Vercel CLI 설치:
   ```bash
   npm i -g vercel
   ```

2. 로그인:
   ```bash
   vercel login
   ```

3. 프로젝트 배포:
   ```bash
   vercel --prod
   ```

4. 환경 변수 설정:
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   # ... 나머지 환경 변수들
   ```

---

## 환경 변수 설정

Vercel 대시보드 → **Project Settings** → **Environment Variables**에서 다음 변수들을 추가:

### 필수 변수

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `NEXT_PUBLIC_APP_URL` | 배포된 앱 URL | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_APP_NAME` | 앱 이름 | `Vibe SaaS` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJ...` |
| `STRIPE_SECRET_KEY` | Stripe Secret Key | `sk_live_...` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe Publishable Key | `pk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook Secret | `whsec_...` |
| `STRIPE_PRICE_ID_STARTER` | Starter 플랜 Price ID | `price_...` |
| `STRIPE_PRICE_ID_PRO` | Pro 플랜 Price ID | `price_...` |
| `STRIPE_PRICE_ID_ENTERPRISE` | Enterprise 플랜 Price ID | `price_...` |

### 선택 변수

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `OPENAI_API_KEY` | OpenAI API 키 | `sk-...` |
| `RESEND_API_KEY` | Resend API 키 | `re_...` |
| `EMAIL_FROM` | 발신 이메일 | `noreply@yourdomain.com` |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog 분석 키 | `phc_...` |

### 환경 변수 적용 범위

각 변수에 대해 적용할 환경 선택:
- ✅ **Production** - 프로덕션 환경
- ✅ **Preview** - PR 프리뷰 환경
- ✅ **Development** - 개발 환경

> ⚠️ **주의**: `SUPABASE_SERVICE_ROLE_KEY`와 `STRIPE_SECRET_KEY`는 민감한 정보입니다. 클라이언트에 노출되지 않도록 주의하세요.

---

## 배포 후 설정

### 1. 도메인 연결 (선택)

1. Vercel 대시보드 → **Project Settings** → **Domains**
2. 커스텀 도메인 추가
3. DNS 레코드 설정:
   - **A Record**: `76.76.19.19`
   - **CNAME**: `cname.vercel-dns.com`

### 2. Supabase URL 업데이트

1. Supabase 대시보드 → **Authentication** → **URL Configuration**
2. **Site URL**을 Vercel 도메인으로 업데이트
3. **Redirect URLs**에 Vercel 도메인 추가

### 3. Stripe Webhook URL 업데이트

1. Stripe 대시보드 → **Developers** → **Webhooks**
2. Endpoint URL을 Vercel 도메인으로 업데이트

### 4. 초기 데이터 시딩

배포 후 시스템 프롬프트 등 초기 데이터를 추가하려면:

1. Supabase SQL Editor에서 `supabase/seed.sql` 실행
2. 또는 관리자 계정 생성 후 대시보드에서 추가

### 5. 관리자 계정 설정

1. 일반 회원가입 진행
2. Supabase → **Table Editor** → **profiles**
3. 해당 사용자의 `role`을 `ADMIN` 또는 `SUPER_ADMIN`으로 변경

---

## 문제 해결

### 빌드 오류

**오류**: `Module not found`
```bash
# 의존성 재설치
rm -rf node_modules package-lock.json
npm install
```

**오류**: TypeScript 오류
```bash
# 타입 검사
npm run type-check
```

### 환경 변수 오류

**증상**: "Invalid Supabase URL" 또는 인증 실패

1. Vercel 환경 변수 확인
2. `NEXT_PUBLIC_` 접두사 확인
3. 변수 값에 불필요한 공백/따옴표 제거
4. 재배포:
   ```bash
   vercel --prod --force
   ```

### Webhook 오류

**증상**: Stripe 결제 후 구독 상태 미반영

1. Stripe 대시보드에서 Webhook 로그 확인
2. Endpoint URL 확인
3. Signing Secret 확인
4. Vercel 함수 로그 확인:
   - Vercel 대시보드 → **Deployments** → **Functions**

### OAuth 오류

**증상**: "redirect_uri_mismatch"

1. Supabase Redirect URLs 확인
2. OAuth Provider Callback URL 확인
3. URL에 후행 슬래시(/) 일관성 확인

### CORS 오류

**증상**: API 호출 시 CORS 오류

1. `next.config.js` headers 설정 확인
2. `vercel.json` headers 설정 확인
3. Supabase URL이 정확한지 확인

---

## 배포 체크리스트

배포 전 확인사항:

- [ ] Supabase 프로젝트 생성 및 스키마 적용
- [ ] Supabase API 키 확인
- [ ] Supabase Site URL 및 Redirect URLs 설정
- [ ] OAuth 제공자 설정 (필요시)
- [ ] Stripe 상품/가격 생성
- [ ] Stripe Webhook 설정
- [ ] Stripe Customer Portal 설정
- [ ] Vercel 환경 변수 설정
- [ ] 커스텀 도메인 설정 (선택)
- [ ] 테스트 결제 진행
- [ ] 관리자 계정 설정

---

## 유용한 명령어

```bash
# 로컬 개발 서버
npm run dev

# 프로덕션 빌드 테스트
npm run build && npm run start

# 타입 검사
npm run type-check

# 린트
npm run lint

# Vercel 프로덕션 배포
vercel --prod

# Vercel 환경 변수 목록
vercel env ls

# Vercel 로그 확인
vercel logs
```

---

## 지원

문제가 발생하면:

1. [GitHub Issues](https://github.com/your-repo/issues)에 이슈 등록
2. [Vercel 문서](https://vercel.com/docs)
3. [Supabase 문서](https://supabase.com/docs)
4. [Stripe 문서](https://stripe.com/docs)
