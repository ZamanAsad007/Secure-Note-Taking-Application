import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const PostsPage = () => {
  const { user, showStatus } = useAuth();

  // Create Post state
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [publishing, setPublishing] = useState(false);

  // Browse Posts by User state (Scenario 2)
  const [targetUserId, setTargetUserId] = useState('');
  const [inputUserId, setInputUserId] = useState('');
  const [postsData, setPostsData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [lookupError, setLookupError] = useState(null);

  // Quick user chips for easy demonstration
  const [knownUsers, setKnownUsers] = useState([]);

  // Fetch users list if possible or set default chips
  useEffect(() => {
    // Attempt to fetch users for quick select if admin, or load own ID
    if (user?._id) {
      setTargetUserId(user._id);
      setInputUserId(user._id);
    }
    // Also try to list users for convenience chips
    api('/api/users?limit=6')
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setKnownUsers(res.data);
        }
      })
      .catch(() => {
        // Not admin or users endpoint not accessible, non-issue
      });
  }, [user]);

  // Load posts for target user
  const fetchUserPosts = async (userId, page = 1) => {
    if (!userId) return;
    setLoadingPosts(true);
    setLookupError(null);
    try {
      const res = await api(`/api/users/${userId}/posts?page=${page}&limit=5`);
      setPostsData(res);
      setCurrentPage(page);
    } catch (err) {
      setLookupError(err.message || 'User not found or unable to fetch posts');
      setPostsData(null);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (targetUserId) {
      fetchUserPosts(targetUserId, 1);
    }
  }, [targetUserId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!inputUserId.trim()) {
      showStatus('Please enter a user ID', true);
      return;
    }
    setTargetUserId(inputUserId.trim());
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) {
      showStatus('Please enter both title and content for the post', true);
      return;
    }

    setPublishing(true);
    try {
      await api('/api/posts', {
        method: 'POST',
        body: JSON.stringify({
          title: postTitle.trim(),
          content: postContent.trim()
        })
      });
      showStatus('Post published successfully to the encrypted workspace timeline!');
      setPostTitle('');
      setPostContent('');

      // If we are currently viewing our own posts, refresh
      if (targetUserId === user?._id) {
        fetchUserPosts(user._id, 1);
      }
    } catch (err) {
      showStatus(err.message, true);
    } finally {
      setPublishing(false);
    }
  };

  const copyShareLink = (title, content) => {
    navigator.clipboard?.writeText?.(`${title}\n\n${content}`);
    showStatus('Post snippet copied to clipboard');
  };

  return (
    <main className="w-full pt-[114px] bg-[var(--bg-color)] min-h-[calc(100vh-64px)] pb-12 transition-colors duration-200">
      <div className="max-w-[1100px] mx-auto p-4 sm:p-6">
        <div className="flex flex-col w-full">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 mb-6 gap-3 border-b border-[var(--card-border)]">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[var(--primary)] text-xs font-semibold tracking-wider uppercase">
                <span className="material-symbols-outlined text-[16px]">forum</span>
                <span>Vault Community Workspace</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--text-color)]">Posts</h1>
              <p className="text-sm text-[var(--text-muted)]">Share updates and browse team publications</p>
            </div>

            {/* Live Feed Activity Metric Widget */}
            <div className="flex items-center gap-3 self-start md:self-auto bg-[var(--card-low)] border border-[var(--card-border)] px-4 py-2 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--tertiary)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--tertiary)]"></span>
                </span>
                <span className="text-xs text-[var(--text-muted)] font-medium">Live Sync Active</span>
              </div>
              <div className="w-px h-4 bg-[var(--card-border)]"></div>
              <span className="text-xs text-[var(--primary)] font-semibold">Feed Node #84</span>
            </div>
          </div>

          {/* Bento Grid: Two Column Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Compose & System Status (lg: 5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Section 1: Write a Post Card */}
              <section className="bg-[var(--card-bg)] rounded-xl p-6 shadow-sm border border-[var(--card-border)] flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary)]">
                      <span className="material-symbols-outlined text-[18px]">edit_note</span>
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-[var(--text-color)]">Write a post</h2>
                      <p className="text-xs text-[var(--text-muted)]">Publish to encrypted workspace timeline</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[var(--card-low)] text-[var(--text-muted)] text-xs font-medium border border-[var(--card-border)]">
                    Public Post
                  </span>
                </div>

                <form className="flex flex-col gap-4 mt-1" onSubmit={handlePublish}>
                  {/* Outlined Input: Title */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[var(--text-color)] uppercase tracking-wider" htmlFor="postTitle">
                      Title
                    </label>
                    <input
                      id="postTitle"
                      className="w-full h-11 px-3.5 rounded-lg bg-[var(--card-low)] border border-[var(--card-border)] text-[var(--text-color)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                      placeholder="Post title..."
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      maxLength={120}
                      required
                      type="text"
                    />
                  </div>

                  {/* Outlined Textarea: Content */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[var(--text-color)] uppercase tracking-wider" htmlFor="postContent">
                      Content
                    </label>
                    <textarea
                      id="postContent"
                      className="w-full p-3.5 rounded-lg bg-[var(--card-low)] border border-[var(--card-border)] text-[var(--text-color)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none leading-relaxed"
                      placeholder="What would you like to share? Write your thoughts here..."
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      maxLength={800}
                      required
                      rows={4}
                    />
                    <div className="flex items-center justify-between text-xs text-[var(--text-muted)] px-1">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-[var(--tertiary)]">lock</span>
                        Encrypted post
                      </span>
                      <span>{postContent.length} / 800</span>
                    </div>
                  </div>

                  {/* Bottom Action Row */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1 text-[var(--text-muted)]">
                      <span className="text-xs text-[var(--text-muted)]">Author: {user?.name}</span>
                    </div>
                    <button
                      className="h-10 px-6 rounded-full bg-[var(--primary)] text-[var(--primary-text)] text-sm font-medium flex items-center gap-2 shadow-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                      disabled={publishing}
                      type="submit"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {publishing ? 'refresh' : 'send'}
                      </span>
                      <span>{publishing ? 'Publishing...' : 'Publish'}</span>
                    </button>
                  </div>
                </form>
              </section>

              {/* Contextual Quick Stats & Encryption Insight */}
              <div className="bg-[var(--card-low)] rounded-xl p-5 border border-[var(--card-border)] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--text-color)]">Community Telemetry</span>
                  <span className="material-symbols-outlined text-[var(--text-muted)] text-[20px]">insights</span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-[var(--card-bg)] p-3.5 rounded-lg border border-[var(--card-border)] flex flex-col">
                    <span className="text-xs text-[var(--text-muted)]">Active Protocol</span>
                    <span className="text-base font-semibold text-[var(--text-color)] mt-1">Scenario 2</span>
                  </div>
                  <div className="bg-[var(--card-bg)] p-3.5 rounded-lg border border-[var(--card-border)] flex flex-col">
                    <span className="text-xs text-[var(--text-muted)]">Index Optimization</span>
                    <span className="text-base font-semibold text-[var(--text-color)] mt-1">author_1__id_-1</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] pt-1">
                  <span className="material-symbols-outlined text-[14px] text-[var(--tertiary)]">check_circle</span>
                  <span>Paginated via limit+1 hasMore cursor aggregation</span>
                </div>
              </div>
            </div>

            {/* Right Column: Browse Posts by User (lg: 7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <section className="bg-[var(--card-bg)] rounded-xl p-6 shadow-sm border border-[var(--card-border)] flex flex-col gap-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[var(--card-low)] border border-[var(--card-border)] flex items-center justify-center text-[var(--text-color)]">
                      <span className="material-symbols-outlined text-[18px]">badge</span>
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-[var(--text-color)]">Browse posts by user</h2>
                      <p className="text-xs text-[var(--text-muted)]">Single-pipeline aggregate lookup by author ID</p>
                    </div>
                  </div>

                  {user?._id && (
                    <button
                      onClick={() => {
                        setInputUserId(user._id);
                        setTargetUserId(user._id);
                      }}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--primary-light)] text-[var(--primary-light-text)] hover:opacity-90 transition-all self-start"
                      type="button"
                    >
                      My Posts
                    </button>
                  )}
                </div>

                {/* Quick select chips for seeded users */}
                {knownUsers.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-xs text-[var(--text-muted)] mr-1">Quick Select:</span>
                    {knownUsers.map((u) => (
                      <button
                        key={u._id}
                        type="button"
                        onClick={() => {
                          setInputUserId(u._id);
                          setTargetUserId(u._id);
                        }}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                          targetUserId === u._id
                            ? 'bg-[var(--primary)] text-[var(--primary-text)]'
                            : 'bg-[var(--card-low)] text-[var(--text-color)] hover:bg-[var(--card-border)]'
                        }`}
                      >
                        {u.name}
                      </button>
                    ))}
                  </div>
                )}

                {/* Search Form Row */}
                <form className="flex flex-col gap-1.5 pt-1" onSubmit={handleSearchSubmit}>
                  <label className="text-xs font-semibold text-[var(--text-color)] uppercase tracking-wider" htmlFor="userIdInput">
                    Target User ID
                  </label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        id="userIdInput"
                        className="w-full h-11 pl-10 pr-3.5 rounded-lg bg-[var(--card-low)] border border-[var(--card-border)] text-[var(--text-color)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors font-mono"
                        placeholder="Paste User ObjectId..."
                        value={inputUserId}
                        onChange={(e) => setInputUserId(e.target.value)}
                        type="text"
                      />
                      <span className="material-symbols-outlined text-[var(--text-muted)] absolute left-3 top-2.5 text-[20px]">
                        fingerprint
                      </span>
                    </div>
                    <button
                      className="h-11 px-5 rounded-full bg-[var(--primary)] text-[var(--primary-text)] text-sm font-medium flex items-center justify-center gap-1.5 shadow-sm hover:opacity-90 active:scale-95 transition-all whitespace-nowrap"
                      type="submit"
                    >
                      <span className="material-symbols-outlined text-[18px]">search</span>
                      <span>Load posts</span>
                    </button>
                  </div>
                </form>

                <div className="w-full h-px bg-[var(--card-border)] my-1"></div>

                {/* Results Section */}
                {loadingPosts ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <span className="material-symbols-outlined text-3xl animate-spin text-[var(--primary)]">
                      refresh
                    </span>
                    <span className="text-sm text-[var(--text-muted)]">Aggregating posts by user...</span>
                  </div>
                ) : lookupError ? (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--error-bg)] text-[var(--error-text)] border border-[var(--error)]/20">
                    <span className="material-symbols-outlined text-[24px]">error</span>
                    <div className="flex flex-col gap-1 flex-1">
                      <span className="font-semibold text-sm">User Not Found or Error</span>
                      <p className="text-xs opacity-90">{lookupError}</p>
                    </div>
                  </div>
                ) : !postsData ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
                    <span className="material-symbols-outlined text-4xl text-[var(--text-muted)]">
                      manage_search
                    </span>
                    <span className="text-sm font-medium text-[var(--text-color)]">
                      Select or enter a user ID to inspect their posts
                    </span>
                  </div>
                ) : postsData.data?.posts?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl bg-[var(--card-low)] text-center gap-3 border border-[var(--card-border)]">
                    <div className="w-12 h-12 rounded-full bg-[var(--card-bg)] flex items-center justify-center text-[var(--text-muted)] shadow-sm">
                      <span className="material-symbols-outlined text-[24px]">post_add</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-semibold text-sm text-[var(--text-color)]">
                        This user has no posts yet
                      </span>
                      <p className="text-xs text-[var(--text-muted)] max-w-sm">
                        {postsData.data?.name || 'This participant'} has not published any public timeline records yet.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {/* Author Banner */}
                    <div className="flex items-center justify-between bg-[var(--card-low)] p-4 rounded-xl border border-[var(--card-border)]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center text-[var(--primary-text)] font-semibold text-base">
                          {postsData.data?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm text-[var(--text-color)]">
                              Posts by {postsData.data?.name}
                            </h3>
                            <span className="px-2 py-0.5 rounded bg-[var(--primary-light)] text-[var(--primary-light-text)] text-xs font-semibold">
                              {postsData.data?.role || 'Contributor'}
                            </span>
                          </div>
                          <span className="text-xs text-[var(--text-muted)] font-mono">
                            {postsData.data?._id}
                          </span>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-[var(--card-bg)] text-[var(--text-color)] text-xs font-medium border border-[var(--card-border)] shadow-sm">
                        {postsData.data?.posts?.length} displayed
                      </span>
                    </div>

                    {/* Posts List */}
                    {postsData.data?.posts?.map((post) => (
                      <article
                        key={post._id}
                        className="bg-[var(--card-bg)] p-5 rounded-xl border border-[var(--card-border)] shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="font-semibold text-base text-[var(--text-color)]">
                            {post.title}
                          </h4>
                          <button
                            onClick={() => copyShareLink(post.title, post.content)}
                            className="text-[var(--text-muted)] hover:text-[var(--text-color)] p-1 rounded-full transition-colors"
                            title="Copy post content"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[18px]">share</span>
                          </button>
                        </div>
                        <p className="text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-wrap">
                          {post.content}
                        </p>
                        <div className="flex items-center justify-between pt-2 border-t border-[var(--card-border)]/50 mt-1">
                          <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                            {new Date(post.createdAt).toLocaleString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-[var(--card-low)] text-[var(--primary)] text-xs font-medium">
                            #post
                          </span>
                        </div>
                      </article>
                    ))}

                    {/* Scenario 2 Pagination (hasMore mode: no total count) */}
                    <div className="flex items-center justify-between pt-2 bg-[var(--card-low)] px-4 py-2.5 rounded-xl border border-[var(--card-border)]">
                      <button
                        onClick={() => fetchUserPosts(targetUserId, currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="px-3.5 py-1.5 rounded-full bg-[var(--card-bg)] text-[var(--text-color)] text-xs font-medium border border-[var(--card-border)] shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                        <span>Prev</span>
                      </button>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[var(--primary)]"></span>
                        <span className="text-xs font-semibold text-[var(--text-color)]">
                          Page {currentPage}
                        </span>
                      </div>
                      <button
                        onClick={() => fetchUserPosts(targetUserId, currentPage + 1)}
                        disabled={!postsData.pagination?.hasMore}
                        className="px-3.5 py-1.5 rounded-full bg-[var(--card-bg)] text-[var(--primary)] text-xs font-medium border border-[var(--card-border)] shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all hover:bg-[var(--card-low)]"
                        type="button"
                      >
                        <span>Next</span>
                        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                      </button>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
