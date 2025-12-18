// Check if input is a command
export function isCommand(text) {
  const lower = text.toLowerCase().trim();
  
  // URL opening command
  if (lower.startsWith('open ')) {
    return true;
  }
  
  // Clipboard commands
  if (lower === 'summarize clipboard' || lower === 'clipboard' || lower === 'paste') {
    return true;
  }
  
  // Copy command
  if (lower.startsWith('copy ')) {
    return true;
  }
  
  // Math expression (basic)
  if (/^[\d+\-*/().\s]+$/.test(lower)) {
    return true;
  }
  
  return false;
}

// Execute a command
export async function executeCommand(text) {
  try {
    const result = await window.clippy?.sendCommand(text);
    
    if (result) {
      return result;
    }
    
    // If no result from main process, it's not a command
    return { type: 'none', content: null };
  } catch (error) {
    return { type: 'error', content: error.message };
  }
}

// Safe math evaluation (for client-side if needed)
export function evalMath(expr) {
  // Only allow safe characters
  if (!/^[\d+\-*/().\s]+$/.test(expr)) {
    throw new Error('Invalid math expression');
  }
  
  try {
    // Use Function constructor for safer eval
    const result = Function(`"use strict"; return (${expr})`)();
    
    if (typeof result !== 'number' || !isFinite(result)) {
      throw new Error('Invalid result');
    }
    
    return result;
  } catch (e) {
    throw new Error('Could not evaluate expression');
  }
}








