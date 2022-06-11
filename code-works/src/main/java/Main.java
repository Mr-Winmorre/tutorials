import java.util.Comparator;
import java.util.PriorityQueue;

public class Main {
    public static void main(String[] args) {
        PriorityQueue<Student> np = new PriorityQueue<Student>(Comparator.comparing(Student::getCgpas));
        np.add(new Student());
        
    }
}
