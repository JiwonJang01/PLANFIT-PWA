import { supabase } from './supabase'

export async function seedTodos() {
  // Fetch existing categories
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*')
    .order('order_index')

  if (catError) {
    console.error('Failed to fetch categories:', catError)
    return
  }

  if (!categories || categories.length === 0) {
    console.warn('No categories found. Please create categories first.')
    return
  }

  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date(now)
  nextWeek.setDate(nextWeek.getDate() + 7)

  const sampleTodos = [
    {
      title: '프로젝트 기획서 작성',
      description: '신규 프로젝트 기획서 초안 작성',
      category_id: categories[0]?.id,
      estimated_duration: 60,
      priority: 'high' as const,
      tags: ['업무', '기획'],
      deadline: tomorrow.toISOString(),
      is_completed: false,
    },
    {
      title: '주간 회의 준비',
      description: '발표 자료 준비',
      category_id: categories[0]?.id,
      estimated_duration: 30,
      priority: 'medium' as const,
      tags: ['업무'],
      deadline: now.toISOString(),
      is_completed: false,
    },
    {
      title: '운동 30분',
      description: null,
      category_id: categories[1]?.id ?? categories[0]?.id,
      estimated_duration: 30,
      priority: 'low' as const,
      tags: ['건강'],
      deadline: null,
      is_completed: false,
    },
    {
      title: 'TypeScript 강의 시청',
      description: 'Udemy 섹션 5-8',
      category_id: categories[2]?.id ?? categories[0]?.id,
      estimated_duration: 90,
      priority: 'medium' as const,
      tags: ['학습', '개발'],
      deadline: nextWeek.toISOString(),
      is_completed: false,
    },
    {
      title: '장보기',
      description: '우유, 계란, 과일',
      category_id: categories[3]?.id ?? categories[0]?.id,
      estimated_duration: 45,
      priority: 'low' as const,
      tags: ['생활'],
      deadline: tomorrow.toISOString(),
      is_completed: false,
    },
    {
      title: '이메일 정리',
      description: '읽지 않은 메일 확인 및 답장',
      category_id: categories[0]?.id,
      estimated_duration: 15,
      priority: 'low' as const,
      tags: ['업무'],
      deadline: null,
      is_completed: true,
      completed_at: now.toISOString(),
    },
  ]

  const { error } = await supabase.from('todos').insert(sampleTodos)

  if (error) {
    console.error('Failed to seed todos:', error)
  } else {
    console.log('Seeded 6 sample todos successfully')
  }
}
