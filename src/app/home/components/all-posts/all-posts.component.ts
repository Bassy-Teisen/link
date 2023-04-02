import {
  Component,
  Input,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { IonInfiniteScroll, ModalController } from '@ionic/angular';
import { Post } from '../../models/Post';
import { PostService } from '../../services/post.service';
import { BehaviorSubject, take } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ModalComponent } from '../start-post/modal/modal.component';

@Component({
  selector: 'app-all-posts',
  templateUrl: './all-posts.component.html',
  styleUrls: ['./all-posts.component.scss'],
})
export class AllPostsComponent implements OnInit {
  @ViewChild(IonInfiniteScroll, { static: false }) infiniteScroll:
    | IonInfiniteScroll
    | undefined;

  @Input() postBody?: string;

  queryParams = '';
  allLoadedPosts: Post[] = [];
  numberOfPosts = 5;
  skipPosts = 0;

  userId$ = new BehaviorSubject<number | null>(null); //null may cause issues later

  constructor(
    private postService: PostService,
    private authService: AuthService,
    public modalController: ModalController,
  ) {}

  ngOnInit() {
    this.getPost(false, '');

    this.authService.userId.pipe(take(1)).subscribe((userId: number) => {
      this.userId$.next(userId);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('changes', changes);

    const postBody = changes['postBody'].currentValue;
    console.log('postBody', postBody);
    if (!postBody) return;
    this.postService.createPost(postBody).subscribe((post: Post) => {
      this.allLoadedPosts.unshift(post);
    });
  }

  getPost(isInitialLoad: boolean, event: any) {
    if (this.skipPosts >= 20) {
      event.target.disable = true;
    }
    this.queryParams = `?take=${this.numberOfPosts}&skip=${this.skipPosts}`;

    this.postService.getSelectedPosts(this.queryParams).subscribe(
      (posts: Post[]) => {
        for (let post = 0; post < posts.length; post++) {
          this.allLoadedPosts.push(posts[post]);
        }
        if (isInitialLoad) event.target.complete();
        this.skipPosts = this.skipPosts + 5;
      },
      (error) => {
        console.log(error);
      },
    );
  }

  loadData(event: any) {
    if (this.infiniteScroll) {
      this.getPost(true, event);

      this.infiniteScroll.complete();
    }
  }

  async presentUpdateModal(postId: number) {
    console.log('Update POST');
    const modal = await this.modalController.create({
      component: ModalComponent,
      cssClass: 'my-custom-class2',
      componentProps: {
        postId,
      },
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (!data) return;

    const newPostBody = data.post.body;
    this.postService.updatePost(postId, newPostBody).subscribe(() => {
      const postIndex = this.allLoadedPosts.findIndex(
        (post: Post) => post.id === postId,
      );
      this.allLoadedPosts[postIndex].body = newPostBody;
    });
  }

  deletePose(postId: number) {
    this.postService.deltePost(postId).subscribe(() => {
      this.allLoadedPosts = this.allLoadedPosts.filter(
        (post: Post) => post.id !== postId,
      );
    });
  }
}
