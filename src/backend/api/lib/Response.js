const Enum = require("../config/Enum");
const CustomError = require("./Error");





class Response {
    constructor() {}

    static successResponse(data,code=200) {
        return {
            code,
            data
        }
    }

    static errorResponse(error) {
  console.error(error);
  if (error instanceof CustomError) {
    return {
      code: error.code,
      error: {
        message: error.message,
        description: error.description
      }
    }
  } else if(error.code === 11000 || error.message?.includes("E11000")) {
    // MongoDB duplicate key error - extract the field name
    console.log("MongoDB Duplicate Key Error:", JSON.stringify(error, null, 2));
    
    let fieldName = "değer";
    if (error.keyPattern) {
      fieldName = Object.keys(error.keyPattern)[0];
    } else if (error.keyValue) {
      fieldName = Object.keys(error.keyValue)[0];
    } else if (error.message) {
      // Try to extract field name from error message
      // MongoDB error format: "E11000 duplicate key error collection: ... index: email_1 dup key: { email: \"...\" }"
      const indexMatch = error.message.match(/index:\s*(\w+)/);
      const dupKeyMatch = error.message.match(/dup key:\s*\{\s*(\w+):/);
      if (dupKeyMatch) {
        fieldName = dupKeyMatch[1];
      } else if (indexMatch) {
        // Remove _1, _2 etc. suffix from index name
        fieldName = indexMatch[1].replace(/_\d+$/, '');
      }
    }
    
    // Translate common field names to Turkish
    const fieldTranslations = {
      'email': 'E-posta adresi',
      'phone_number': 'Telefon numarası',
      'phoneNumber': 'Telefon numarası',
      'email_1': 'E-posta adresi'
    };
    
    const translatedField = fieldTranslations[fieldName] || fieldName;
    
    return {
      code: Enum.HTTP_CODES.CONFLICT,
      error: {
        message: "Kayıt Hatası",
        description: `${translatedField} zaten kayıtlı. Lütfen farklı bir ${translatedField} kullanın.`
      }
    }
  }
  return {
    code: Enum?.HTTP_CODES?.INT_SERVER_ERROR ?? 500,
    error: {
      message: "Unknown Error!",
      description: error?.message || String(error)
    }
  }
}

}

module.exports = Response;