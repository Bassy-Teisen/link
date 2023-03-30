import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll } from '@ionic/angular';
import { Post } from '../../models/Post';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-all-posts',
  templateUrl: './all-posts.component.html',
  styleUrls: ['./all-posts.component.scss'],
})
export class AllPostsComponent implements OnInit {
  @ViewChild(IonInfiniteScroll, { static: false }) infiniteScroll:
    | IonInfiniteScroll
    | undefined;

  queryParams = '';
  allLoadedPosts: Post[] = [];
  numberOfPosts = 5;
  skipPosts = 0;

  constructor(private postService: PostService) {}

  ngOnInit() {
    this.getPost(false, '');
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
        console.log('skip', this.skipPosts)
        console.log('isInitialLoad', isInitialLoad)
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
}
