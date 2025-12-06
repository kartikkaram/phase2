class apiError extends Error {
    // Constructor for the ApiError class
    constructor(statusCode, message = "something went wrong", errors = [], stack = "") {
        // Call the parent class (Error) constructor with the message parameter
        super(message);
        
        // Set the status code for the error (e.g., 400 for Bad Request)
        this.statusCode = statusCode;
        
        // The message passed to the error, defaults to "something went wrong"
        this.message = message;
        
        // success property to indicate operation status (false means error)
        this.success = false;
        
        // Store additional errors like validation errors
        this.errors = errors;

        // If stack is provided, use it; otherwise, capture the stack trace automatically
        if (stack) {
            this.stack = stack;
        } else {
            // Capture stack trace for this error object
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

// Export the ApiError class for use in other parts of the application
export { apiError };
