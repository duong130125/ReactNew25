import { useEffect, useState } from "react";
import "./PostsList.css";
import axios from "axios";

interface Posts {
  id: number;
  title: string;
  image: string;
  create_at: string;
  status: string;
}

export default function PostsList() {
  const [posts, setPosts] = useState<Posts[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Posts[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentArticle, setCurrentArticle] = useState<Posts | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [newPost, setNewPost] = useState<{
    id?: number;
    title: string;
    image: string;
    create_at: string;
  }>({
    title: "",
    image: "",
    create_at: "",
  });
  const [error, setError] = useState<string>("");
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [postToDelete, setPostToDelete] = useState<Posts | null>(null);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    LoaldatatPosts();
  }, []);

  const LoaldatatPosts = () => {
    axios
      .get("http://localhost:8080/Posts")
      .then((response) => {
        setPosts(response.data);
      })
      .catch((error) => console.error("có lỗi xảy ra.", error));
  };

  useEffect(() => {
    if (searchKeyword.trim() !== "") {
      axios
        .get(`http://localhost:8080/Posts?title_like=${searchKeyword}`)
        .then((response) => {
          setFilteredPosts(response.data);
        })
        .catch((error) => console.error("Có lỗi xảy ra.", error));
    } else {
      setFilteredPosts(posts);
    }
  }, [searchKeyword, posts]);

  useEffect(() => {
    if (statusFilter !== "all") {
      axios
        .get(`http://localhost:8080/Posts?status_like=${statusFilter}`)
        .then((response) => {
          setFilteredPosts(response.data);
        })
        .catch((error) => console.error("Có lỗi xảy ra.", error));
    } else {
      setFilteredPosts(posts);
    }
  }, [statusFilter, posts]);

  const handleBlockClick = (article: Posts) => {
    setCurrentArticle(article);
    setShowModal(true);
  };

  const handleCancelBlock = () => {
    setShowModal(false);
    setCurrentArticle(null);
  };

  const handleConfirmBlock = () => {
    if (!currentArticle) return;

    const newStatus =
      currentArticle.status === "Ngừng xuất bản"
        ? "Đã xuất bản"
        : "Ngừng xuất bản";

    axios
      .patch(`http://localhost:8080/Posts/${currentArticle.id}`, {
        status: newStatus,
      })
      .then(() => {
        const updatedPosts = posts.map((article) =>
          article.id === currentArticle.id
            ? { ...article, status: newStatus }
            : article
        );
        setPosts(updatedPosts);
        setFilteredPosts(updatedPosts);
        setShowModal(false);
        setCurrentArticle(null);
      })
      .catch((error) => console.error("Có lỗi xảy ra.", error));
  };

  const handleAddPostClick = () => {
    setIsEditMode(false);
    setShowAddForm(true);
  };

  const handleCloseAddForm = () => {
    setShowAddForm(false);
  };

  const handleResetForm = () => {
    setShowResetConfirm(true);
  };

  const confirmResetForm = () => {
    setNewPost({ title: "", image: "", create_at: "" });
    setShowResetConfirm(false);
  };

  const handlePublishPost = () => {
    setError("");

    if (!newPost.title || !newPost.image || !newPost.create_at) {
      setError("Tên bài viết, hình ảnh và ngày thêm không được để trống");
      return;
    }

    if (
      posts.some(
        (post) => post.title === newPost.title && post.id !== newPost.id
      )
    ) {
      setError("Tên bài viết không được phép trùng");
      return;
    }

    if (isEditMode) {
      // Update existing post
      axios
        .put(`http://localhost:8080/Posts/${newPost.id}`, newPost)
        .then((response) => {
          const updatedPosts = posts.map((post) =>
            post.id === newPost.id ? response.data : post
          );
          setPosts(updatedPosts);
          setFilteredPosts(updatedPosts);
          setShowAddForm(false);
          setNewPost({ title: "", image: "", create_at: "" });
        })
        .catch((error) => console.error("Có lỗi xảy ra.", error));
    } else {
      // Add new post
      axios
        .post("http://localhost:8080/Posts", {
          ...newPost,
          status: "Đã xuất bản",
        })
        .then((response) => {
          const updatedPosts = [...posts, response.data];
          setPosts(updatedPosts);
          setFilteredPosts(updatedPosts);
          setShowAddForm(false);
          setNewPost({ title: "", image: "", create_at: "" });
        })
        .catch((error) => console.error("Có lỗi xảy ra.", error));
    }
  };

  const handleDeleteClick = (article: Posts) => {
    setPostToDelete(article);
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setPostToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (!postToDelete) return;

    axios
      .delete(`http://localhost:8080/Posts/${postToDelete.id}`)
      .then(() => {
        const updatedPosts = posts.filter(
          (article) => article.id !== postToDelete.id
        );
        setPosts(updatedPosts);
        setFilteredPosts(updatedPosts);
        setShowDeleteConfirm(false);
        setPostToDelete(null);
      })
      .catch((error) => console.error("Có lỗi xảy ra.", error));
  };

  const handleEditClick = (article: Posts) => {
    setIsEditMode(true);
    setNewPost({ ...article });
    setShowAddForm(true);
  };

  const handleCancelEdit = () => {
    setShowAddForm(false);
    setNewPost({ title: "", image: "", create_at: "" });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
  };

  const handleStatusFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setStatusFilter(e.target.value);
  };

  return (
    <>
      <div className="footer">Quản lý bài viết</div>
      <div className="container">
        <div className="header">
          <input
            type="text"
            placeholder="Nhập từ khóa tìm kiếm"
            value={searchKeyword}
            onChange={handleSearchChange}
          />
          <select value={statusFilter} onChange={handleStatusFilterChange}>
            <option value="all">Lọc bài viết</option>
            <option value="Đã xuất bản">Đã xuất bản</option>
            <option value="Ngừng xuất bản">Ngừng xuất bản</option>
          </select>
          <button onClick={handleAddPostClick}>Thêm mới bài viết</button>
        </div>
        <div className="table-container">
          {filteredPosts.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tiêu đề</th>
                  <th>Hình ảnh</th>
                  <th>Ngày viết</th>
                  <th>Trạng thái</th>
                  <th>Chức năng</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((article, index) => (
                  <tr key={article.id}>
                    <td>{index + 1}</td>
                    <td>{article.title}</td>
                    <td>
                      <img src={article.image} alt={article.title} />
                    </td>
                    <td>{article.create_at}</td>
                    <td>
                      <span
                        className={`status ${
                          article.status === "Ngừng xuất bản"
                            ? "blocked"
                            : "published"
                        }`}
                      >
                        {article.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="block"
                        onClick={() => handleBlockClick(article)}
                      >
                        Chặn
                      </button>
                      <button
                        className="edit"
                        onClick={() => handleEditClick(article)}
                      >
                        Sửa
                      </button>
                      <button
                        className="delete"
                        onClick={() => handleDeleteClick(article)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Không có kết quả tìm kiếm</p>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Xác nhận</h2>
            <p>
              Bạn có chắc chắn muốn{" "}
              {currentArticle?.status === "Ngừng xuất bản"
                ? "xuất bản bài viết này?"
                : "ngừng xuất bản bài viết này?"}
            </p>
            <button onClick={handleCancelBlock}>Hủy</button>
            <button onClick={handleConfirmBlock}>Xác nhận</button>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-icon" onClick={handleCloseAddForm}>
              &times;
            </button>
            <h2>{isEditMode ? "Cập nhật bài viết" : "Thêm mới bài viết"}</h2>
            <label>
              Tên bài viết:
              <input
                type="text"
                value={newPost.title}
                onChange={(e) =>
                  setNewPost({ ...newPost, title: e.target.value })
                }
              />
            </label>
            <label>
              Hình ảnh:
              <input
                type="text"
                value={newPost.image}
                onChange={(e) =>
                  setNewPost({ ...newPost, image: e.target.value })
                }
              />
            </label>
            <label>
              Ngày thêm:
              <input
                type="date"
                value={newPost.create_at}
                onChange={(e) =>
                  setNewPost({ ...newPost, create_at: e.target.value })
                }
              />
            </label>
            {error && <p className="error">{error}</p>}
            <button onClick={handleResetForm}>Làm mới</button>
            <button
              onClick={isEditMode ? handleCancelEdit : handleCloseAddForm}
            >
              Hủy
            </button>
            <button onClick={handlePublishPost}>
              {isEditMode ? "Cập nhật" : "Xuất bản"}
            </button>
          </div>
        </div>
      )}

      {showResetConfirm && (
        <div className="modal">
          <div className="modal-content">
            <h2>Xác nhận</h2>
            <p>Bạn có chắc chắn muốn xóa hết giá trị trong các input?</p>
            <button onClick={() => setShowResetConfirm(false)}>Hủy</button>
            <button onClick={confirmResetForm}>Xác nhận</button>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal">
          <div className="modal-content">
            <h2>Xác nhận</h2>
            <p>Bạn có chắc chắn muốn xóa bài viết này?</p>
            <button onClick={handleCancelDelete}>Hủy</button>
            <button onClick={handleConfirmDelete}>Đồng ý</button>
          </div>
        </div>
      )}
    </>
  );
}
