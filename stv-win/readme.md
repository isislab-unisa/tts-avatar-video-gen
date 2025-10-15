# Unity Automated Video Generator

A command-line Unity application that automatically generates a video file by playing a specified audio clip alongside a pre-set character animation and lip-sync. The application runs and quits automatically upon completion.

## Before starting

Due to GitHub LFS (Large File Storage) limitations, a key asset file is provided as a zip archive. Before running the application, you must unpack it.

1. Navigate to the `stv-win/VideoGenerator_data/` directory.
2. Unzip the contents of `sharedassets0.assets.zip` into this same folder.

## How to use

The application is run from a command prompt or terminal. The only argument required is the path to the audio file you want to use. You can use a relative path (e.g., `demo1.wav`) if the audio file is in the same directory as the executable, or an absolute path for files located elsewhere.

### Windows

1. Open Command Prompt or PowerShell.
2. Navigate to the directory containing the application executable using the `cd` command.
    ```
    cd C:\path\to\your\application
    ```
3. Run the application, followed by the path to your audio file.
  
    **Example (no spaces in path):**
  
    ```
    .\VideoGenerator.exe demo1.wav
    ```
  
    **Example (with spaces in path):**
  
    ```
    .\VideoGenerator.exe "C:\Users\Your User\My Music\cool soundtrack.wav"
    ```

### Mac

TODO

## Output

The application will generate a single video file named **`output.mp4`**. This file will be created in the **same directory** as the application executable.

> **Warning:** Running the application again in the same directory will **overwrite** the existing `output.mp4` file without warning.
