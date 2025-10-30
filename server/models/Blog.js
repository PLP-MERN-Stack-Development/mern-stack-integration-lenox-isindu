import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Blog name is required'],
    trim: true,
    maxlength: [50, 'Blog name cannot exceed 50 characters']
  },
  subdomain: {
    type: String,
    required: [true, 'Subdomain is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-z0-9-]+$/, 'Subdomain can only contain letters, numbers, and hyphens']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot exceed 200 characters'],
    default: 'Welcome to my blog!'
  }
}, {
  timestamps: true
});

// Auto-create subdomain from username
blogSchema.pre('save', function(next) {
  if (!this.subdomain) {
    this.subdomain = this.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  }
  next();
});

export default mongoose.model('Blog', blogSchema);