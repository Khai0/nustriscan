import { foodItemRepository } from '@repositories/food-item.repository'
import { NotFoundError } from '@utils/errors'
import { paginate } from '@utils/pagination'
import type { CreateFoodItemDto, UpdateFoodItemDto, FoodSearchQueryDto } from '@dto/food/food-item.dto'
import type { FoodItem } from '@prisma/client'

export const foodItemService = {
  async search(query: FoodSearchQueryDto) {
    const { items, total } = await foodItemRepository.search(
      query.q,
      query.category,
      query.page,
      query.limit
    )
    return paginate(items, query.page, query.limit, total)
  },

  async findById(id: string): Promise<FoodItem> {
    const item = await foodItemRepository.findById(id)
    if (!item) throw new NotFoundError('Không tìm thấy thực phẩm')
    return item
  },

  async create(dto: CreateFoodItemDto, createdBy?: string): Promise<FoodItem> {
    return foodItemRepository.create({
      ...dto,
      createdBy: createdBy ?? null,
      isVerified: false,
    })
  },

  async update(id: string, dto: UpdateFoodItemDto): Promise<FoodItem> {
    await foodItemService.findById(id) // throws if not found
    return foodItemRepository.update(id, dto)
  },
}
