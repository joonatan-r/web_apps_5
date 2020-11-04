function checkRow(row) {
  for (let i = 1; i < row.length; i++) {
    if (row[i - 1] !== row[i] || row[i] === "") return false;
  }
  return true;
}

function checkForWin(board) {
  let tempRow = null,
    prevRow = null,
    prevRowForColCheck = null,
    diagIdxLeft = 0,
    diagIdxRight = board.length - 1,
    equalOnDiagLeft = true,
    equalOnDiagRight = true;

  for (let row of board) {
    if (checkRow(row)) return true;

    // handle column checking

    if (!prevRowForColCheck) {
      prevRowForColCheck = row;
    } else {
      tempRow = [];

      for (let i = 0; i < row.length; i++) {
        tempRow.push(
          prevRowForColCheck[i] === row[i] && row[i] !== "" ? row[i] : null
        );
      }
      prevRowForColCheck = tempRow;
    }

    // handle left diagonal checking

    if (
      row[diagIdxLeft] === "" ||
      (diagIdxLeft !== 0 && row[diagIdxLeft] !== prevRow[diagIdxLeft - 1])
    ) {
      equalOnDiagLeft = false;
    }

    // handle right diagonal checking

    if (
      row[diagIdxRight] === "" ||
      (diagIdxRight !== board.length - 1 &&
        row[diagIdxRight] !== prevRow[diagIdxRight + 1])
    ) {
      equalOnDiagRight = false;
    }

    // finalize iteration

    prevRow = row;
    diagIdxLeft++;
    diagIdxRight--;
  }
  for (let cell of prevRowForColCheck) {
    if (cell !== null) return true;
  }
  if (equalOnDiagLeft) return true;
  if (equalOnDiagRight) return true;

  return false;
}

module.exports = checkForWin;
