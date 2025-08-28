import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'avatar',
})
export class AvatarPipe implements PipeTransform {
  transform(value: string): string {
    return 'https://api.dicebear.com/9.x/initials/svg?seed=' + value;
  }
}
