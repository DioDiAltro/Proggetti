// Insertion sort: come quando si riordinano le carte in mano.
// La parte a[0..i-1] è già ordinata; a[i] viene inserito al posto giusto
// facendo scorrere a destra gli elementi più grandi.
#include <iostream>
#include <vector>
using namespace std;

//@region sort
void insertionSort(vector<int>& a) {
    int n = a.size();
    for (int i = 1; i < n; i++) {               //@outer
        int key = a[i];                         //@key
        int j = i - 1;                          //@j-init
        while (j >= 0 && a[j] > key) {          //@cmp
            a[j + 1] = a[j];                    //@shift
            j--;                                //@dec
        }
        a[j + 1] = key;                         //@place
    }
}
//@endregion

void stampa(const vector<int>& a) {
    for (int x : a) cout << x << ' ';
    cout << '\n';
}

int main() {
    vector<int> a = {5, 2, 4, 6, 1, 3};
    cout << "Prima: ";
    stampa(a);
    insertionSort(a);
    cout << "Dopo:  ";
    stampa(a);
    return 0;
}
