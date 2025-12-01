# 개발 가이드

이 문서는 Vibe SaaS 스타터 킷을 기반으로 SaaS 제품을 개발할 때의 절차와 유의사항을 설명합니다.

## 목차

1. [시작하기](#시작하기)
2. [개발 환경 설정](#개발-환경-설정)
3. [주요 개발 패턴](#주요-개발-패턴)
4. [기능 확장 가이드](#기능-확장-가이드)
5. [보안 고려사항](#보안-고려사항)
6. [성능 최적화](#성능-최적화)
7. [테스트](#테스트)
8. [배포 프로세스](#배포-프로세스)

---

## 시작하기

### 1. 저장소 복제 및 의존성 설치

```bash
# 저장소 복제
git clone <repository-url> my-saas-project
cd my-saas-project

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
```

### 2. Supabase 프로젝트 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. SQL Editor에서 마이그레이션 실행:
   ```sql
   -- supabase/migrations/00001_initial_schema.sql
   -- supabase/migrations/00002_payment_providers.sql
   ```
3. API 키를 `.env.local`에 복사

### 3. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인

---

## 개발 환경 설정

### 환경 변수

```env
# .env.local

# 필수
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# 결제 (개발 시 테스트 키 사용)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
TOSS_CLIENT_KEY="test_ck_..."
TOSS_SECRET_KEY="test_sk_..."

# OAuth
NAVER_CLIENT_ID="..."
NAVER_CLIENT_SECRET="..."
```

### VS Code 권장 확장

```json
// .vscode/extensions.json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma"
  ]
}
```

### 코드 포맷팅 설정

```json
// .vscode/settings.json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

---

## 주요 개발 패턴

### 1. 서버 컴포넌트 vs 클라이언트 컴포넌트

```tsx
// 서버 컴포넌트 (기본값) - 데이터 패칭에 적합
// src/app/dashboard/page.tsx
import { getUser } from '@/lib/auth';

export default async function DashboardPage() {
  const user = await getUser();
  return <div>Welcome, {user?.name}</div>;
}

// 클라이언트 컴포넌트 - 상호작용에 필요
// src/app/dashboard/client-component.tsx
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

**규칙:**
- 데이터 패칭 → 서버 컴포넌트
- 이벤트 핸들러, useState, useEffect → 클라이언트 컴포넌트
- 가능한 서버 컴포넌트 사용 (번들 크기 감소)

### 2. API 라우트 패턴

```typescript
// src/app/api/example/route.ts
import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

// GET 요청
export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('table')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST 요청
export async function POST(req: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    // 유효성 검사
    const validated = schema.parse(body);

    // 데이터 처리...

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation Error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

### 3. 데이터베이스 쿼리 패턴

```typescript
// 기본 CRUD
const supabase = await createClient();

// Create
const { data, error } = await supabase
  .from('prompts')
  .insert({ name: 'New Prompt', user_id: userId })
  .select()
  .single();

// Read (단일)
const { data } = await supabase
  .from('prompts')
  .select('*')
  .eq('id', promptId)
  .single();

// Read (목록 + 관계)
const { data } = await supabase
  .from('prompts')
  .select(`
    *,
    user:profiles(name, avatar_url),
    usages:prompt_usages(count)
  `)
  .eq('user_id', userId)
  .order('created_at', { ascending: false });

// Update
const { error } = await supabase
  .from('prompts')
  .update({ name: 'Updated Name' })
  .eq('id', promptId);

// Delete
const { error } = await supabase
  .from('prompts')
  .delete()
  .eq('id', promptId);
```

### 4. 인증 체크 패턴

```typescript
// API 라우트에서
import { getUser } from '@/lib/auth';

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ...
}

// 서버 컴포넌트에서
import { requireAuth } from '@/lib/auth';

export default async function ProtectedPage() {
  const user = await requireAuth(); // 미인증시 /login으로 리다이렉트
  // ...
}

// 역할 기반 접근
import { requireRole } from '@/lib/auth';

export default async function AdminPage() {
  const user = await requireRole(['ADMIN', 'SUPER_ADMIN']);
  // ...
}
```

### 5. 폼 처리 패턴

```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

const schema = z.object({
  name: z.string().min(2, '이름은 2자 이상'),
  email: z.string().email('올바른 이메일 형식'),
});

type FormData = z.infer<typeof schema>;

export function MyForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch('/api/example', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed');

      toast.success('저장되었습니다');
    } catch {
      toast.error('오류가 발생했습니다');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register('name')} error={!!errors.name} />
      {errors.name && <p className="text-destructive">{errors.name.message}</p>}

      <Button type="submit" loading={isSubmitting}>
        저장
      </Button>
    </form>
  );
}
```

---

## 기능 확장 가이드

### 새 페이지 추가

```bash
# 새 대시보드 페이지
mkdir -p src/app/(dashboard)/dashboard/new-feature
touch src/app/(dashboard)/dashboard/new-feature/page.tsx
```

```tsx
// src/app/(dashboard)/dashboard/new-feature/page.tsx
import { requireAuth } from '@/lib/auth';

export default async function NewFeaturePage() {
  const user = await requireAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">새 기능</h1>
      {/* 페이지 내용 */}
    </div>
  );
}
```

### 새 API 엔드포인트 추가

```bash
# 새 API 라우트
mkdir -p src/app/api/new-feature
touch src/app/api/new-feature/route.ts
```

### 새 데이터베이스 테이블 추가

```sql
-- supabase/migrations/00003_new_feature.sql

CREATE TABLE new_feature (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE new_feature ENABLE ROW LEVEL SECURITY;

-- 정책 생성
CREATE POLICY "Users can view own data"
    ON new_feature FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own data"
    ON new_feature FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- 인덱스
CREATE INDEX idx_new_feature_user ON new_feature(user_id);
```

### 새 UI 컴포넌트 추가

```tsx
// src/components/ui/new-component.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

interface NewComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary';
}

const NewComponent = React.forwardRef<HTMLDivElement, NewComponentProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'base-styles',
          variant === 'secondary' && 'secondary-styles',
          className
        )}
        {...props}
      />
    );
  }
);
NewComponent.displayName = 'NewComponent';

export { NewComponent };
```

### 사이드바 메뉴 추가

```tsx
// src/components/layout/sidebar.tsx
const navigation = [
  { name: '대시보드', href: '/dashboard', icon: Home },
  { name: '프롬프트', href: '/dashboard/prompts', icon: MessageSquare },
  // 새 메뉴 추가
  { name: '새 기능', href: '/dashboard/new-feature', icon: Star },
];
```

---

## 보안 고려사항

### 1. 인증 필수 적용

```typescript
// 모든 API 라우트에서 인증 체크
export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ...
}
```

### 2. RLS 정책 필수

```sql
-- 항상 RLS 활성화
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;

-- 최소 권한 원칙
CREATE POLICY "Users can only access own data"
    ON your_table FOR ALL
    USING (user_id = auth.uid());
```

### 3. 입력 유효성 검사

```typescript
// Zod로 항상 입력 검증
const schema = z.object({
  email: z.string().email(),
  amount: z.number().positive().max(1000000),
});

const validated = schema.parse(body);
```

### 4. 환경 변수 관리

```typescript
// 클라이언트에 노출되면 안 되는 변수
// ❌ NEXT_PUBLIC_STRIPE_SECRET_KEY (노출됨)
// ✅ STRIPE_SECRET_KEY (서버에서만 접근)

// 서버에서만 사용
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required');
}
```

### 5. SQL 인젝션 방지

```typescript
// ✅ 파라미터 바인딩 사용 (Supabase가 자동 처리)
const { data } = await supabase
  .from('prompts')
  .select('*')
  .eq('id', userInput);  // 안전하게 이스케이프됨

// ❌ 직접 문자열 연결 금지
// const query = `SELECT * FROM prompts WHERE id = '${userInput}'`;
```

### 6. XSS 방지

```tsx
// React는 기본적으로 XSS 방지
// ✅ 안전
<div>{userContent}</div>

// ❌ 위험 - 반드시 필요한 경우만 사용하고 sanitize 필수
<div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
```

### 7. CSRF 보호

```typescript
// Next.js API 라우트는 기본적으로 Same-Origin 정책 적용
// 추가 보호가 필요한 경우:
export async function POST(req: Request) {
  const origin = req.headers.get('origin');
  if (origin !== process.env.NEXT_PUBLIC_APP_URL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
}
```

---

## 성능 최적화

### 1. 이미지 최적화

```tsx
import Image from 'next/image';

// ✅ next/image 사용
<Image
  src="/hero.png"
  alt="Hero"
  width={800}
  height={600}
  priority  // LCP 이미지에 사용
/>
```

### 2. 코드 스플리팅

```tsx
// 동적 임포트로 번들 분리
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
});
```

### 3. 데이터 캐싱

```typescript
// React Query 캐싱
const { data } = useQuery({
  queryKey: ['prompts', userId],
  queryFn: fetchPrompts,
  staleTime: 5 * 60 * 1000,  // 5분간 fresh
  cacheTime: 30 * 60 * 1000, // 30분간 캐시 유지
});
```

### 4. 서버 컴포넌트 활용

```tsx
// 서버에서 데이터 패칭 - 클라이언트 번들에 포함 안됨
export default async function Page() {
  const data = await fetchData(); // 서버에서 실행
  return <ClientComponent data={data} />;
}
```

### 5. 데이터베이스 쿼리 최적화

```typescript
// 필요한 컬럼만 선택
const { data } = await supabase
  .from('prompts')
  .select('id, name, created_at')  // * 대신 필요한 것만
  .limit(20);  // 페이지네이션

// 인덱스 활용
// CREATE INDEX idx_prompts_user_created ON prompts(user_id, created_at DESC);
```

---

## 테스트

### 단위 테스트

```typescript
// __tests__/utils.test.ts
import { formatPrice } from '@/lib/payments/region';

describe('formatPrice', () => {
  it('should format KRW correctly', () => {
    expect(formatPrice(19000, 'KR')).toBe('₩19,000');
  });

  it('should format USD correctly', () => {
    expect(formatPrice(19, 'GLOBAL')).toBe('$19');
  });
});
```

### API 테스트

```typescript
// __tests__/api/prompts.test.ts
import { GET } from '@/app/api/prompts/route';

describe('GET /api/prompts', () => {
  it('should return 401 for unauthenticated requests', async () => {
    const response = await GET();
    expect(response.status).toBe(401);
  });
});
```

### E2E 테스트 (Playwright)

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('should login successfully', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

---

## 배포 프로세스

### 1. 개발 → 스테이징

```bash
# feature 브랜치에서 개발
git checkout -b feature/new-feature

# 커밋
git add .
git commit -m "feat: 새 기능 추가"

# PR 생성 → Vercel Preview 자동 배포
git push origin feature/new-feature
```

### 2. 스테이징 → 프로덕션

```bash
# main 브랜치로 머지
git checkout main
git merge feature/new-feature
git push origin main

# Vercel이 자동으로 프로덕션 배포
```

### 3. 배포 전 체크리스트

- [ ] 모든 환경 변수 설정 확인
- [ ] 데이터베이스 마이그레이션 적용
- [ ] API 엔드포인트 테스트
- [ ] OAuth 콜백 URL 업데이트
- [ ] Webhook URL 업데이트
- [ ] 테스트 결제 진행

### 4. 롤백

```bash
# Vercel 대시보드에서 이전 배포로 롤백
# 또는 CLI:
vercel rollback
```

---

## 유의사항

### 1. 환경별 설정

| 환경 | URL | DB | 결제 |
|------|-----|-----|------|
| 개발 | localhost:3000 | 로컬/테스트 DB | 테스트 키 |
| 스테이징 | preview.vercel.app | 스테이징 DB | 테스트 키 |
| 프로덕션 | yourdomain.com | 프로덕션 DB | 라이브 키 |

### 2. 커밋 메시지 컨벤션

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 추가
chore: 빌드, 설정 변경
```

### 3. 브랜치 전략

```
main          - 프로덕션 배포
└── develop   - 개발 통합
    ├── feature/xxx  - 기능 개발
    ├── fix/xxx      - 버그 수정
    └── hotfix/xxx   - 긴급 수정
```

### 4. 코드 리뷰 체크리스트

- [ ] 인증 체크 적용 여부
- [ ] RLS 정책 설정 여부
- [ ] 입력 유효성 검사
- [ ] 에러 핸들링
- [ ] TypeScript 타입 정의
- [ ] 불필요한 console.log 제거

---

## 자주 묻는 질문

### Q: 새 OAuth 제공자를 추가하려면?

1. Supabase에서 지원하는 경우: Dashboard → Authentication → Providers에서 활성화
2. 미지원 제공자: 네이버 OAuth 구현 참고 (`/api/auth/naver/`)

### Q: 새 결제 수단을 추가하려면?

1. `/src/lib/payments/`에 새 프로바이더 구현
2. `types.ts`에 타입 추가
3. `index.ts`에 통합

### Q: 다국어 지원을 추가하려면?

1. `next-intl` 또는 `next-i18next` 패키지 설치
2. `/messages` 디렉토리에 번역 파일 추가
3. 미들웨어에서 로케일 감지 설정

### Q: 실시간 기능을 추가하려면?

```typescript
// Supabase Realtime 사용
const supabase = createClient();

supabase
  .channel('table-changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' },
    (payload) => {
      console.log('Change:', payload);
    }
  )
  .subscribe();
```

---

## 지원 & 리소스

- [Next.js 문서](https://nextjs.org/docs)
- [Supabase 문서](https://supabase.com/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [shadcn/ui 문서](https://ui.shadcn.com)
- [Stripe 문서](https://stripe.com/docs)
- [토스페이먼츠 문서](https://docs.tosspayments.com)
