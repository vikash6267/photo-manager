// UserSearch.js
import React, { useState } from 'react';
import axios from 'axios';

const UserSearch = ({ onUserSelect }) => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);

  const searchUsers = async () => {
    try {
      const { data } = await axios.get(`http://localhost:4000/api/v1/chat/serach`, { params: { query } });
      setUsers(data);
      
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  return (
    <div className="p-4">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border rounded-lg px-4 py-2"
        placeholder="Search users..."
      />
      <button onClick={searchUsers} className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-lg">Search</button>
      <div className="mt-4">
        {users.map((user) => (
          <div key={user._id} className="p-2 border-b cursor-pointer" onClick={() => onUserSelect(user._id)}>
            {user.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserSearch;
