# script.py
import sys

def main():
    # Read input from stdin
    input_string = sys.stdin.read().strip()
    
    # Process the input (for example, just return it with some modifications)
    output_string = f"Processed: {input_string}"
    
    # Print the output string, which will be captured in stdout
    print(output_string)

if __name__ == "__main__":
    main()