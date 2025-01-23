The back-end of my social media app called Pastel, built in NodeJs using the ExpressJs framework and a MongoDB database
- Handled authentification using jwt tokens
- The post controller will give you different posts based on whether you're requesting the feed or explore page
- The feed api endpoint will return only the posts from the profiles that the user follows. It will also return the users' own posts
- The explore api endpoint will return all posts from all users
- Posts and comments are sorted by date, giving you the newests posts and comments first
- Can handle search requests and will find both users and post containing the requested keyword