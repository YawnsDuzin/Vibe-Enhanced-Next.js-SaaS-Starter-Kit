# 기술 스택

이 문서는 Vibe SaaS 스타터 킷에서 사용하는 기술 스택을 상세히 설명합니다.

## 기술 스택 요약

| 분류 | 기술 | 버전 | 용도 |
|------|------|------|------|
| **프레임워크** | Next.js | 14.x | 풀스택 React 프레임워크 |
| **언어** | TypeScript | 5.x | 타입 안전성 |
| **스타일링** | Tailwind CSS | 3.x | 유틸리티 기반 CSS |
| **UI 컴포넌트** | shadcn/ui | - | Radix UI 기반 컴포넌트 |
| **데이터베이스** | Supabase (PostgreSQL) | - | BaaS, 인증, 실시간 |
| **인증** | Supabase Auth | - | OAuth, 이메일 인증 |
| **결제 (해외)** | Stripe | - | 구독, 결제 |
| **결제 (한국)** | 토스페이먼츠 | - | 카드, 계좌이체 |
| **상태 관리** | TanStack Query | 5.x | 서버 상태 관리 |
| **폼** | React Hook Form | 7.x | 폼 상태 관리 |
| **유효성 검사** | Zod | 3.x | 스키마 유효성 검사 |
| **AI** | OpenAI SDK | 4.x | AI 프롬프트 생성 |
| **이메일** | Resend | - | 트랜잭션 이메일 |
| **배포** | Vercel | - | 서버리스 배포 |

---

## 프레임워크 & 런타임

### Next.js 14

```typescript
// App Router 사용
// 서버 컴포넌트 기본, 클라이언트 컴포넌트는 'use client' 선언
```

**주요 기능:**
- **App Router**: 파일 시스템 기반 라우팅
- **Server Components**: 서버에서 렌더링되는 컴포넌트 (기본값)
- **Server Actions**: 서버 사이드 뮤테이션
- **Route Handlers**: API 엔드포인트 (`route.ts`)
- **Middleware**: 요청 전처리
- **Image Optimization**: 자동 이미지 최적화
- **Font Optimization**: 폰트 최적화

**사용 이유:**
- React 기반 풀스택 개발
- 뛰어난 성능 (SSR, SSG, ISR)
- Vercel과의 완벽한 통합
- 활발한 커뮤니티

### TypeScript

```typescript
// 엄격한 타입 체크
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true
  }
}
```

**주요 설정:**
- 절대 경로 import (`@/`)
- 엄격 모드 활성화
- 경로 별칭 설정

---

## 스타일링

### Tailwind CSS

```tsx
// 유틸리티 클래스 기반 스타일링
<button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
  Click me
</button>
```

**커스텀 설정 (`tailwind.config.ts`):**
- CSS 변수 기반 테마 색상
- 커스텀 애니메이션
- 다크 모드 지원

### shadcn/ui

```tsx
// Radix UI 기반 접근성 높은 컴포넌트
import { Button } from '@/components/ui/button';

<Button variant="outline" size="lg">
  버튼
</Button>
```

**특징:**
- 복사-붙여넣기 방식 (종속성 없음)
- 완전한 커스터마이징 가능
- Radix UI 프리미티브 기반
- 접근성 (ARIA) 준수

**포함된 컴포넌트:**
- Button, Input, Card, Dialog
- Dropdown Menu, Select, Tabs
- Avatar, Badge, Checkbox, Switch
- Progress, Separator, Toast

---

## 백엔드 & 데이터베이스

### Supabase

```typescript
// 서버 사이드 클라이언트
import { createClient } from '@/lib/supabase/server';

const supabase = await createClient();
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId);
```

**제공 기능:**
- **PostgreSQL 데이터베이스**: 관계형 데이터 저장
- **인증**: OAuth, 이메일/비밀번호, Magic Link
- **Row Level Security (RLS)**: 행 단위 접근 제어
- **실시간 구독**: 데이터 변경 실시간 알림
- **Storage**: 파일 저장
- **Edge Functions**: 서버리스 함수

**데이터베이스 스키마:**

```sql
-- 핵심 테이블
profiles          -- 사용자 프로필
teams             -- 팀 정보
team_members      -- 팀 멤버 관계
subscriptions     -- 구독 정보
prompts           -- AI 프롬프트
api_keys          -- API 키
audit_logs        -- 감사 로그
```

### Row Level Security (RLS)

```sql
-- 자신의 프로필만 조회 가능
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);
```

---

## 인증

### Supabase Auth

```typescript
// OAuth 로그인
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${origin}/auth/callback`,
  },
});
```

**지원 인증 방식:**

| 방식 | 설명 |
|------|------|
| Google OAuth | Supabase 기본 지원 |
| 카카오 OAuth | Supabase 기본 지원 |
| 네이버 OAuth | 커스텀 구현 (Magic Link 활용) |
| 이메일/비밀번호 | 기본 인증 |
| Magic Link | 이메일 링크 인증 |

### 세션 관리

```typescript
// 미들웨어에서 세션 갱신
export async function middleware(request: NextRequest) {
  const supabase = createMiddlewareClient({ req, res });
  await supabase.auth.getSession();
}
```

---

## 결제 시스템

### Stripe (해외 결제)

```typescript
// Checkout 세션 생성
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  payment_method_types: ['card'],
  line_items: [{ price: priceId, quantity: 1 }],
  success_url: `${origin}/dashboard/billing?success=true`,
  cancel_url: `${origin}/dashboard/billing?canceled=true`,
});
```

**기능:**
- 구독 관리
- Customer Portal
- Webhook 이벤트 처리
- 다양한 결제 수단

### 토스페이먼츠 (한국 결제)

```typescript
// 결제 승인
const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
  method: 'POST',
  headers: {
    Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`,
  },
  body: JSON.stringify({ paymentKey, orderId, amount }),
});
```

**기능:**
- 신용/체크카드 결제
- 계좌이체
- 간편결제 (카카오페이 등)
- 정기결제 (빌링키)

### 리전 기반 결제 선택

```typescript
// 자동 리전 감지
const region = detectRegionClient(); // 'KR' or 'GLOBAL'
const provider = region === 'KR' ? 'toss' : 'stripe';
```

---

## 상태 관리

### TanStack Query (React Query)

```typescript
// 데이터 패칭
const { data, isLoading, error } = useQuery({
  queryKey: ['prompts'],
  queryFn: () => fetch('/api/prompts').then(res => res.json()),
});

// 뮤테이션
const mutation = useMutation({
  mutationFn: (newPrompt) => fetch('/api/prompts', {
    method: 'POST',
    body: JSON.stringify(newPrompt),
  }),
  onSuccess: () => queryClient.invalidateQueries(['prompts']),
});
```

**장점:**
- 자동 캐싱 및 무효화
- 백그라운드 리페치
- 낙관적 업데이트
- 요청 중복 제거

### Zustand (필요시)

```typescript
// 클라이언트 상태 관리 (선택적)
import { create } from 'zustand';

const useStore = create((set) => ({
  theme: 'light',
  setTheme: (theme) => set({ theme }),
}));
```

---

## 폼 & 유효성 검사

### React Hook Form

```typescript
const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema),
});

<Input {...register('email')} error={!!errors.email} />
```

**장점:**
- 비제어 컴포넌트 기반
- 최소 리렌더링
- 뛰어난 성능

### Zod

```typescript
const loginSchema = z.object({
  email: z.string().email('올바른 이메일을 입력하세요'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다'),
});

type LoginForm = z.infer<typeof loginSchema>;
```

**장점:**
- TypeScript 타입 추론
- 런타임 유효성 검사
- 커스텀 에러 메시지

---

## AI 통합

### OpenAI SDK

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const completion = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ],
});
```

**사용처:**
- 프롬프트 생성
- 콘텐츠 생성
- 텍스트 변환

---

## 이메일

### Resend

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'noreply@yourdomain.com',
  to: user.email,
  subject: '환영합니다!',
  html: emailTemplate,
});
```

**사용처:**
- 환영 이메일
- 비밀번호 재설정
- 팀 초대
- 결제 확인

---

## 배포 & 인프라

### Vercel

```json
// vercel.json
{
  "framework": "nextjs",
  "regions": ["icn1"],  // 서울 리전
  "headers": [...]
}
```

**기능:**
- 자동 CI/CD
- 프리뷰 배포
- 에지 네트워크
- 서버리스 함수
- 분석 및 모니터링

### 환경 변수

```bash
# 클라이언트 노출 (NEXT_PUBLIC_)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# 서버 전용
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
```

---

## 개발 도구

### ESLint

```json
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

### Prettier (권장)

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

---

## 패키지 의존성

### 주요 의존성

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "@supabase/supabase-js": "^2.0.0",
    "@supabase/ssr": "^0.1.0",
    "stripe": "^14.0.0",
    "@tanstack/react-query": "^5.0.0",
    "react-hook-form": "^7.0.0",
    "@hookform/resolvers": "^3.0.0",
    "zod": "^3.0.0",
    "openai": "^4.0.0",
    "resend": "^2.0.0",
    "sonner": "^1.0.0",
    "lucide-react": "^0.300.0"
  }
}
```

### UI 의존성

```json
{
  "dependencies": {
    "@radix-ui/react-avatar": "^1.0.0",
    "@radix-ui/react-dialog": "^1.0.0",
    "@radix-ui/react-dropdown-menu": "^2.0.0",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-tabs": "^1.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  }
}
```

---

## 기술 선택 이유

| 기술 | 선택 이유 |
|------|----------|
| Next.js | React 생태계 + 풀스택 + Vercel 통합 |
| Supabase | Firebase 대안, PostgreSQL 기반, 오픈소스 |
| Tailwind CSS | 빠른 개발, 일관된 디자인 시스템 |
| shadcn/ui | 커스터마이징 용이, 종속성 없음 |
| Stripe | 글로벌 결제 표준 |
| 토스페이먼츠 | 한국 로컬 결제 최적화 |
| TanStack Query | 서버 상태 관리 최적화 |
| Zod | TypeScript 친화적 유효성 검사 |
