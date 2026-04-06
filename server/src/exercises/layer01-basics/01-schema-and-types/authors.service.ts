import { Injectable } from '@nestjs/common';
import { Author } from './authors.model';

@Injectable()
export class AuthorService {
  private items: Author[] = [
    { id: 'a1', name: 'taro', country: 'Japan' },
    { id: 'a2', name: 'jiro', country: 'Japan' },
    { id: 'a3', name: 'mika', country: 'Japan' },
  ];

  findOne(id: string): Author | null {
    console.log('execute fineOne', id);
    return this.items.find((e) => e.id === id) ?? null;
  }
}
