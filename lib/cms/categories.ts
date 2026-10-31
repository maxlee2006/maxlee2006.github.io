import { createClient } from '../../utils/supabase/client'
import { categorySchema, type Category } from './content'

// Original category metadata, used only for migration fixtures and tests.
// Runtime pages always read the database; errors are surfaced instead of masked.
export const originalCategories: Category[] = [
  { page: 'portfolio', slug: 'modeling', title: 'Modeling', image: '/assets/images/vicar-head.jpg', image_position: 'center', columns: 3, sort_order: 0 },
  { page: 'portfolio', slug: 'animation', title: 'Animations', image: '/assets/images/DMT.png', image_position: 'center', columns: 3, sort_order: 1 },
  { page: 'portfolio', slug: 'sketches', title: 'Sketches', image: '/assets/images/bg-notxt.png', image_position: 'center', columns: 3, sort_order: 2 },
  { page: 'design', slug: 'ue', title: 'Unreal Engine 5', image: '/assets/images/ue-still.png', image_position: 'center', columns: 2, sort_order: 0 },
  { page: 'professional-projects', slug: 'custom-engines', title: 'Custom Engines', image: '/assets/images/Screenshot_02.png', image_position: 'center', columns: 2, sort_order: 0 },
  { page: 'professional-projects', slug: 'web-development', title: 'Web Development', image: '/assets/images/mn-web.png', logo: '/assets/images/mn-logo-128.png', image_position: 'top', columns: 2, sort_order: 1 },
]

export async function readCategories(): Promise<Category[]> {
  const categories: Category[] = []
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await createClient().from('categories')
      .select('page,slug,title,image,logo,image_position,columns,sort_order')
      .order('sort_order').order('slug').order('page').range(offset, offset + 499)
      .abortSignal(AbortSignal.timeout(15000))
    if (error || !data) throw new Error('Could not load categories. Please try again.')
    categories.push(...data.map(row => categorySchema.parse(row)))
    if (data.length < 500) return categories
  }
}
