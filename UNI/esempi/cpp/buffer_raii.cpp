// RAII: il costruttore prende la memoria, il distruttore la restituisce.
// AddressSanitizer conferma che non resta niente da liberare.
#include <iostream>
using namespace std;

//@region buffer
class Buffer {
    int* dati;
    int n;
public:
    Buffer(int n) : dati(new int[n]()), n(n) {}     // acquisisce la memoria (azzerata)
    ~Buffer() { delete[] dati; }                    // la rilascia, sempre
    Buffer(const Buffer&) = delete;                 // copia vietata: due oggetti
    Buffer& operator=(const Buffer&) = delete;      // non devono liberare lo stesso array
    int& operator[](int i) { return dati[i]; }
    int dimensione() const { return n; }
};

void f() {
    Buffer b(1000);
    b[0] = 42;
    cout << "b[0] = " << b[0] << ", elementi: " << b.dimensione() << '\n';
}   // qui il distruttore di b libera l'array
//@endregion

int main() {
    f();
    f();
    cout << "nessuna perdita di memoria\n";
    return 0;
}
