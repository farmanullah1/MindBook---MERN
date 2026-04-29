import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar';
import RightSidebar from '../../components/RightSidebar/RightSidebar';
import Post from '../../components/Post/Post';
import api from '../../services/api';
import { IUser, IPost } from '../../types';
import { getInitials } from '../../utils/helpers';
import './Search.css';

interface SearchResults {
  users: IUser[];
  posts: IPost[];
  groups: any[];
}

const Search: React.FC = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q');
  
  const [results, setResults] = React.useState<SearchResults>({ users: [], posts: [], groups: [] });
  const [loading, setLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'all' | 'users' | 'posts' | 'groups'>('all');

  React.useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      setLoading(true);
      try {
        const res = await api.get(`/search?q=${query}`);
        setResults(res.data);
      } catch (error) {
        console.error('Search failed', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  return (
    <>
      <Navbar />
      <div className="app-layout">
        <LeftSidebar />
        <main className="main-content">
          <div className="search-results-container">
            <div className="search-header card">
              <h2>Search results for "{query}"</h2>
              <div className="search-tabs">
                <button 
                  className={`search-tab ${activeTab === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveTab('all')}
                >
                  All
                </button>
                <button 
                  className={`search-tab ${activeTab === 'users' ? 'active' : ''}`}
                  onClick={() => setActiveTab('users')}
                >
                  People
                </button>
                <button 
                  className={`search-tab ${activeTab === 'posts' ? 'active' : ''}`}
                  onClick={() => setActiveTab('posts')}
                >
                  Posts
                </button>
                <button 
                  className={`search-tab ${activeTab === 'groups' ? 'active' : ''}`}
                  onClick={() => setActiveTab('groups')}
                >
                  Groups
                </button>
              </div>
            </div>

            {loading ? (
              <div className="search-loading">
                <div className="spinner" />
              </div>
            ) : (
              <div className="search-content">
                {/* Users Section */}
                {(activeTab === 'all' || activeTab === 'users') && results.users.length > 0 && (
                  <div className="search-section card">
                    <h3 className="section-title">People</h3>
                    <div className="user-results">
                      {results.users.map(user => (
                        <Link key={user._id} to={`/profile/${user._id}`} className="user-result-item">
                          <div className="user-avatar">
                            {user.profilePicture ? (
                              <img src={user.profilePicture} alt={user.name} />
                            ) : (
                              <div className="avatar-initials">{getInitials(user.name)}</div>
                            )}
                          </div>
                          <div className="user-info">
                            <span className="user-name">{user.name}</span>
                            <span className="user-sub">User • {user.friends?.length || 0} friends</span>
                          </div>
                          <button className="btn btn-secondary btn-sm">View Profile</button>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Groups Section */}
                {(activeTab === 'all' || activeTab === 'groups') && results.groups.length > 0 && (
                  <div className="search-section card">
                    <h3 className="section-title">Groups</h3>
                    <div className="group-results">
                      {results.groups.map(group => (
                        <Link key={group._id} to={`/groups/${group._id}`} className="group-result-item">
                          <div className="group-avatar">
                            {group.coverPhoto ? (
                              <img src={group.coverPhoto} alt={group.name} />
                            ) : (
                              <div className="group-icon">👥</div>
                            )}
                          </div>
                          <div className="group-info">
                            <span className="group-name">{group.name}</span>
                            <span className="group-sub">{group.privacy} Group • {group.members?.length || 0} members</span>
                          </div>
                          <button className="btn btn-secondary btn-sm">Join Group</button>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Posts Section */}
                {(activeTab === 'all' || activeTab === 'posts') && results.posts.length > 0 && (
                  <div className="search-section">
                    <h3 className="section-title">Posts</h3>
                    <div className="post-results">
                      {results.posts.map(post => (
                        <Post key={post._id} post={post} />
                      ))}
                    </div>
                  </div>
                )}

                {results.users.length === 0 && results.posts.length === 0 && results.groups.length === 0 && (
                  <div className="search-empty card">
                    <h3>No results found</h3>
                    <p>Try searching for something else.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
        <RightSidebar />
      </div>
    </>
  );
};

export default Search;
