# PlanFit - 개인 할 일 관리 PWA

## 프로젝트 개요
- 이름: PlanFit
- 유형: Progressive Web App (PWA)
- 사용자: 단일 사용자 (나만 사용)
- 핵심 기능: 타임 블로킹 기반 할 일 관리

## 기술 스택

### Frontend
- React 18 + TypeScript
- Vite (빌드 도구)
- Tailwind CSS + shadcn/ui
- FullCalendar (캘린더)
- dnd-kit (드래그 앤 드롭)
- TanStack Query (서버 상태)
- Zustand (클라이언트 상태)

### Backend
- Supabase (PostgreSQL + Realtime + Storage)

### PWA
- vite-plugin-pwa
- Workbox (Service Worker)

## 프로젝트 구조
```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── MobileNav.tsx
│   │   └── RightPanel.tsx
│   ├── calendar/
│   │   ├── CalendarView.tsx
│   │   ├── EventBlock.tsx
│   │   └── TimeGrid.tsx
│   ├── todo/
│   │   ├── TodoList.tsx
│   │   ├── TodoCard.tsx
│   │   ├── TodoModal.tsx
│   │   ├── ChecklistItem.tsx
│   │   └── CategoryFilter.tsx
│   ├── habit/
│   │   ├── HabitList.tsx
│   │   ├── HabitCard.tsx
│   │   └── HabitModal.tsx
│   └── ui/ (shadcn/ui 컴포넌트들)
├── hooks/
│   ├── useTodos.ts
│   ├── useCategories.ts
│   ├── useCalendarEvents.ts
│   ├── useHabits.ts
│   └── useDragAndDrop.ts
├── store/
│   ├── todoStore.ts
│   ├── calendarStore.ts
│   └── settingsStore.ts
├── lib/
│   ├── supabase.ts
│   ├── google-calendar.ts
│   └── db.ts (IndexedDB)
└── styles/
    └── globals.css
```

## 데이터베이스 스키마

### categories
- id (UUID, PK)
- name (VARCHAR)
- color (VARCHAR) - hex 색상
- icon (VARCHAR) - 이모지
- order_index (INTEGER)

### todos
- id (UUID, PK)
- title (VARCHAR, required)
- description (TEXT)
- category_id (UUID, FK → categories)
- estimated_duration (INTEGER, required) - 분 단위
- priority (VARCHAR) - high/medium/low
- tags (TEXT[])
- deadline (TIMESTAMP)
- is_completed (BOOLEAN)
- completed_at (TIMESTAMP)

### calendar_events
- id (UUID, PK)
- todo_id (UUID, FK → todos)
- start_time (TIMESTAMP, required)
- end_time (TIMESTAMP, required)
- color (VARCHAR)

### checklist_items
- id (UUID, PK)
- todo_id (UUID, FK → todos)
- content (VARCHAR)
- is_checked (BOOLEAN)
- order_index (INTEGER)

### comments
- id (UUID, PK)
- todo_id (UUID, FK → todos)
- content (TEXT)
- created_at (TIMESTAMP)

### habits
- id (UUID, PK)
- name (VARCHAR)
- days_of_week (INTEGER[]) - 0(일)~6(토)
- time_of_day (TIME)
- reminder_enabled (BOOLEAN)
- reminder_minutes_before (INTEGER)
- color (VARCHAR)

### habit_completions
- id (UUID, PK)
- habit_id (UUID, FK → habits)
- completed_date (DATE)
- completed_at (TIMESTAMP)

### google_calendar_cache
- id (UUID, PK)
- event_id (VARCHAR, unique)
- title (VARCHAR)
- start_time (TIMESTAMP)
- end_time (TIMESTAMP)
- synced_at (TIMESTAMP)

## 핵심 기능

### 1. 할 일 관리
- CRUD 기능
- 카테고리별 분류
- 예상 소요 시간 설정 (15분 단위)
- 우선순위, 태그, 마감일
- 체크리스트
- 시간순 댓글/메모

### 2. 캘린더 (타임 블로킹)
- 드래그 앤 드롭으로 할 일을 시간대에 배치
- 15분 단위 그리드
- 일간/3일/주간/월간 뷰
- 구글 캘린더 읽기 (빈 시간 파악용)
- 이벤트 오버랩 허용 (나란히 배치)

### 3. 습관 추적
- 요일별 반복 설정
- 시간 설정
- 알림
- 완료 체크

### 4. PWA 기능
- 오프라인 작동 (Service Worker + IndexedDB)
- 홈 화면 추가
- 푸시 알림
- 자동 업데이트

### 5. 백업
- 매월 1일 자동 CSV 백업
- 로컬 다운로드 또는 구글 드라이브

## 코딩 규칙

### TypeScript
- 엄격 모드 사용
- any 타입 지양
- 인터페이스 정의 필수

### React
- 함수형 컴포넌트만 사용
- Custom Hooks로 로직 분리
- Props 타입 명확히 정의

### 스타일링
- Tailwind CSS 유틸리티 클래스 우선
- 반응형: sm (640px), md (768px), lg (1024px)
- 다크 모드 지원

### 파일명
- 컴포넌트: PascalCase (TodoCard.tsx)
- Hooks: camelCase (useTodos.ts)
- 유틸: camelCase (supabase.ts)

## 환경 변수
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_GOOGLE_CLIENT_ID=
```

## 참고
- 단일 사용자이므로 인증 불필요
- 할 일 복사 기능 (같은 할 일을 여러 시간대에 배치 가능)
- 완료된 할 일은 매월 백업 후 삭제