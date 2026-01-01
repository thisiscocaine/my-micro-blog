import React from 'react';
export default function Contact() {
  return (
    <div className="container center">
      <h2>Contact Us</h2>
      <form>
        <input type="text" name="full_name" placeholder="Full Name" required />
        <input type="email" name="email" placeholder="Email" required />
        <textarea name="message" placeholder="Message" required />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
