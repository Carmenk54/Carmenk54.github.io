function mergeSort(arr, left, right) {
    if (right - left <= 1)
        return;
    
    let mid = Math.floor((right - left) / 2) + left;
    mergeSort(arr, left, mid);
    mergeSort(arr, mid, right);
    merge(arr, left, mid, right);
}

function merge(arr, left, mid, right) {
    let posL = left;
    let posR = mid;

    let merged = [];
    while (posL < mid || posR < right) {
        if (posL >= mid)
            merged.push(arr[posR++]);
        else if (posR >= right)
            merged.push(arr[posL++]);
        else {
            if (arr[posL].date > arr[posR].date)
                merged.push(arr[posR++]);
            else
                merged.push(arr[posL++]);
        }
    }

    for (let i = 0; i<merged.length; i++) {
        arr[i+left] = merged[i];
    }
}