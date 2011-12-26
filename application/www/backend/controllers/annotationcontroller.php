<?php
//array(array(GPL]]

require_once 'framework/controller/controller.php';
require_once 'util/authentication.php';

/**
 * Annotation controller class.
 */
class AnnotationController extends Controller
{
    /**
     * Loads annotation(s).
     */
    public function actionLoad($data)
    {
        Log::debug('Fetching annotations: %s', print_r($data, true));
        
        return array(
            'total'   => 2,
            'records' => array(
                array(
                    'annId' => 1,
                    'vertices' => array(
                        array('x' => 10, 'y' => 10),
                        array('x' => 60, 'y' => 50),
                        array('x' => 110, 'y' => 10),
                        array('x' => 110, 'y' => 110),
                        array('x' => 60, 'y' => 150),
                        array('x' => 10, 'y' => 110)
                    ),
                    
                    // NOTE: Do not use these names, I was lazy.
                    'eng' => 'Hello, world!',
                    'orig' => 'Hallo, wereld!'
                ),
                array(
                    'annId' => 2,
                    'vertices' => array(
                        array('x' => 122, 'y' => 152),
                        array('x' => 130, 'y' => 152),
                        array('x' => 130, 'y' => 160),
                        array('x' => 122, 'y' => 160)
                    ),
                    
                    // NOTE: Do not use these names, I was lazy.
                    'eng' => 'On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble that are bound to ensue; and equal blame belongs to those who fail in their duty through weakness of will, which is the same as saying through shrinking from toil and pain. These cases are perfectly simple and easy to distinguish. In a free hour, when our power of choice is untrammelled and when nothing prevents our being able to do what we like best, every pleasure is to be welcomed and every pain avoided. But in certain circumstances and owing to the claims of duty or the obligations of business it will frequently occur that pleasures have to be repudiated and annoyances accepted. The wise man therefore always holds in these matters to this principle of selection: he rejects pleasures to secure other greater pleasures, or else he endures pains to avoid worse pains.',
                    'orig' => 'At vero eos et accusamus et iusto odio dignissimos ducimus, qui blanditiis praesentium voluptatum deleniti atque corrupti, quos dolores et quas molestias excepturi sint, obcaecati cupiditate non provident, similique sunt in culpa, qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio, cumque nihil impedit, quo minus id, quod maxime placeat, facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet, ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat...'
                )
            )
        );
    }
}
