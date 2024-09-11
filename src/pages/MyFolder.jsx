import React, { useEffect, useState } from "react";
import { getAllFolders, createFolder } from "../service/operations/folder"; // Assuming you have a createFolder function in the API service
import { useSelector } from "react-redux";
import { FaFolder } from "react-icons/fa"; // Using react-icons for folder icon
import { Link } from "react-router-dom";

function MyFolder() {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false); // State to control modal visibility
  const [folderName, setFolderName] = useState(""); // State to manage folder name input
  const { token } = useSelector((state) => state.auth);

  // Fetch folders from API
  const fetchFolders = async () => {
    try {
      const res = await getAllFolders(token);
      setFolders(res); // Adjust based on your API response
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch folders");
      setLoading(false);
    }
  };

  // Create folder function to handle form submission
  const handleCreateFolder = async () => {
    if (folderName.trim() === "") return; // Prevent creating folders without a name
    try {
      await createFolder({ folderName }, token);
      setFolderName(""); // Clear input after folder creation
      setOpen(false); // Close modal
      fetchFolders(); // Refresh folder list
    } catch (err) {
      setError("Failed to create folder");
    }
  };

  useEffect(() => {
    fetchFolders();
  }, [token]);

  const handleOpenModal = () => setOpen(true);
  const handleCloseModal = () => {
    setOpen(false);
    setFolderName(""); // Clear input when closing modal
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">My Folders</h1>
        <button
          onClick={handleOpenModal}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          Create Folder
        </button>
      </div>

      {/* Display folders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {folders.length === 0 ? (
          <div>No folders available</div>
        ) : (
          folders.map((folder) => (
            <Link
            to={`/${folder?.folderName}/${folder?._id}`}
              key={folder._id}
              className="flex items-center p-4 bg-gray-800 text-white rounded-md shadow-md"
            >
              <FaFolder className="text-3xl mr-3" />
              <span className="text-lg">{folder.folderName}</span>
            </Link>
          ))
        )}
      </div>

      {/* Modal for creating a new folder */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">Create New Folder</h2>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Folder Name"
              className="border p-2 w-full mb-4"
            />
            <div className="flex justify-end">
              <button
                onClick={handleCloseModal}
                className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyFolder;
