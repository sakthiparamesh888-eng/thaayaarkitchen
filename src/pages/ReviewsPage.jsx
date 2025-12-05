import React, { useState, useEffect } from "react";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const REVIEWS_WEBHOOK = import.meta.env.VITE_REVIEWS_WEBHOOK;
  const REVIEWS_JSON = import.meta.env.VITE_REVIEWS_SHEET_JSON;

  // 🔄 Auto-fetch reviews every 10 seconds
  useEffect(() => {
    if (!REVIEWS_JSON) return;

    const fetchReviews = () => {
      fetch(REVIEWS_JSON)
        .then(res => res.json())
        .then(data => {
          setReviews(data.reverse()); // newest first
          setLoadingReviews(false);
        })
        .catch(() => setLoadingReviews(false));
    };

    fetchReviews();                    // Initial load
    const interval = setInterval(fetchReviews, 8000); // Auto-refresh

    return () => clearInterval(interval);
  }, []);

  // ⬆ Submitting a Review
  async function submitReview() {
    if (!name || !review) return alert("Please enter your name & review!");

    setLoading(true);

    const payload = { name, rating, review };

    try {
      await fetch(REVIEWS_WEBHOOK, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      alert("✨ Thank you! Your review has been added!");

      setName("");
      setRating(5);
      setReview("");

      setTimeout(() => window.location.reload(), 500);
    } catch {
      alert("❌ Failed to submit review. Try again!");
    }

    setLoading(false);
  }

  return (
    <div className="reviews-wrapper">
      <h1 className="title-main">⭐ Customer Reviews</h1>

      {/* Write Review Form */}
      <div className="glass-card review-form fade-soft">
        <h2 className="form-title">Write a Review</h2>

        <input
          className="input-modern"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="label">Rating</label>
        <select
          className="select modern-select"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
        >
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} ⭐
            </option>
          ))}
        </select>

        <textarea
          className="input-modern textarea"
          placeholder="Write your review..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />

        <button 
          className="btn-submit"
          onClick={submitReview}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Review ✨"}
        </button>
      </div>

      {/* Reviews List */}
      <h2 className="reviews-subtitle">💬 What Customers Say</h2>

      {loadingReviews && <p className="loading-text">Loading reviews...</p>}

      <div className="reviews-list">
        {reviews.map((rev, i) => (
          <div key={i} className="glass-card review-box fade-soft">
            <div className="review-name">
              {rev.name} • <span className="star">{rev.rating}⭐</span>
            </div>
            <div className="review-text">{rev.review}</div>
          </div>
        ))}
      </div>

      <style>
        {`
        /* Background */
        .reviews-wrapper {
          padding: 30px 15px;
          background: radial-gradient(circle at top, #0a1a2b, #030712 75%);
          min-height: 100vh;
          color: #e8f4ff;
        }

        .title-main {
          text-align: center;
          color: #bde0ff;
          font-size: 2rem;
          margin-bottom: 25px;
          font-weight: 700;
          text-shadow: 0 0 15px rgba(0,150,255,0.6);
        }

        /* Fade Animation */
        .fade-soft {
          animation: fadeSoft 0.7s ease-in-out;
        }
        @keyframes fadeSoft {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Review Form */
        .review-form {
          padding: 22px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255,255,255,0.18);
          box-shadow: 0 0 18px rgba(0, 140, 255, 0.20);
          margin-bottom: 35px;
        }

        .form-title {
          color: #8ecaff;
          font-size: 1.4rem;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .input-modern, .textarea, .select {
          width: 100%;
          padding: 12px;
          margin: 10px 0;
          border-radius: 10px;
          background: rgba(255,255,255,0.15);
          border: none;
          outline: none;
          color: white;
          font-size: 1rem;
        }

        .textarea {
          min-height: 110px;
          resize: none;
        }

        .btn-submit {
          width: 100%;
          padding: 12px;
          margin-top: 10px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(90deg, #3ba9ff, #005eff);
          color: white;
          font-size: 1.15rem;
          font-weight: 600;
          cursor: pointer;
          transition: 0.25s;
        }

        .btn-submit:hover {
          opacity: 0.9;
          transform: scale(1.02);
        }

        /* Reviews List */
        .reviews-subtitle {
          margin-top: 20px;
          text-align: center;
          color: #9bd1ff;
          font-size: 1.4rem;
        }

        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-top: 15px;
        }

        .review-box {
          padding: 18px;
          border-radius: 18px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.16);
          backdrop-filter: blur(14px);
          box-shadow: 0 0 18px rgba(0,140,255,0.22);
        }

        .review-name {
          font-size: 1.2rem;
          font-weight: 600;
          color: #7bc9ff;
        }

        .star {
          color: gold;
        }

        .review-text {
          margin-top: 5px;
          font-size: 1rem;
          opacity: 0.9;
        }

        .loading-text {
          color: #99cfff;
          text-align: center;
          margin-top: 10px;
        }
        `}
      </style>
    </div>
  );
}
